import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 데이터베이스 테이블과 CSV 컬럼에 맞춘 타입 정의
interface ProductCsvRow {
  name: string
  description: string
  price: string
  category_name: string
  stock_quantity: string
  sku: string // SKU를 기준으로 upsert 하므로 필수로 지정
  manufacturer?: string
  main_image_filename: string
  additional_image_filenames?: string
}

// 텍스트를 URL 친화적인 slug로 변환하는 헬퍼 함수
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 영문, 숫자, 공백, 하이픈만 허용
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

serve(async (req) => {
  // OPTIONS 요청(preflight) 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Supabase Admin 클라이언트 생성 (Service Role 키 사용)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )
    const storageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public`

    console.log('Starting data import process...')

    // 2. Supabase Storage에서 CSV 파일 가져오기
    const csvUrl = `${storageUrl}/data/products_data.csv`
    const csvResponse = await fetch(csvUrl)
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`)
    }
    const csvText = await csvResponse.text()

    // 3. Deno 표준 라이브러리를 사용하여 CSV 파싱
    const csvData = await parse(csvText, {
      skipFirstRow: true,
      columns: [
        'name', 'description', 'price', 'category_name', 'stock_quantity',
        'sku', 'manufacturer', 'main_image_filename', 'additional_image_filenames'
      ],
    }) as ProductCsvRow[]

    console.log(`Parsed ${csvData.length} rows from CSV.`)

    // --- 4. 카테고리 일괄 처리 ---
    const uniqueCategories = [...new Map(csvData.map(row => [
      row.category_name, {
        name: row.category_name,
        slug: generateSlug(row.category_name),
        description: `Products in the ${row.category_name} category`,
      }
    ])).values()]

    console.log(`Found ${uniqueCategories.length} unique categories. Upserting...`)
    const { data: upsertedCategories, error: categoryError } = await supabaseAdmin
      .from('categories')
      .upsert(uniqueCategories, { onConflict: 'slug' })
      .select('id, name')

    if (categoryError) throw categoryError

    // 카테고리 이름과 ID를 매핑하는 캐시 생성
    const categoryNameToIdMap = new Map(upsertedCategories!.map(c => [c.name, c.id]))

    // --- 5. 제품 데이터 일괄 처리 ---
    const productsToUpsert = csvData.map(row => {
      const categoryId = categoryNameToIdMap.get(row.category_name)
      if (!categoryId) {
        console.warn(`Category '${row.category_name}' not found for product SKU '${row.sku}'. Skipping.`)
        return null
      }

      const constructImageUrl = (filename: string) => `${storageUrl}/imager/${filename.trim()}`

      const additionalImages = row.additional_image_filenames
        ? row.additional_image_filenames.split(';').filter(f => f.trim()).map(constructImageUrl)
        : []

      return {
        name: row.name,
        slug: generateSlug(row.name),
        description: row.description,
        price: parseFloat(row.price.replace(/[^0-9.]/g, '')) || 0,
        sku: row.sku,
        stock_quantity: parseInt(row.stock_quantity, 10) || 0,
        manufacturer: row.manufacturer || null,
        category_id: categoryId,
        main_image_url: constructImageUrl(row.main_image_filename),
        image_urls: additionalImages,
        is_published: true,
      }
    }).filter(p => p !== null) // 유효하지 않은 제품(카테고리 없는) 제외

    console.log(`Prepared ${productsToUpsert.length} products. Upserting...`)
    const { data: upsertedProducts, error: productError } = await supabaseAdmin
      .from('products')
      .upsert(productsToUpsert, { onConflict: 'sku' })
      .select('id')

    if (productError) throw productError

    const result = {
      success: true,
      message: 'Import completed successfully.',
      stats: {
        csvRows: csvData.length,
        categoriesUpserted: upsertedCategories?.length ?? 0,
        productsUpserted: upsertedProducts?.length ?? 0,
      }
    }

    console.log('Import completed:', result)
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Import error:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})