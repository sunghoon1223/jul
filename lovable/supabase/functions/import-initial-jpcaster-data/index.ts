import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CSVRow {
  id?: string
  name: string
  description: string
  price: string
  category_name: string
  stock_quantity: string
  sku?: string
  manufacturer?: string
  main_image_filename: string
  additional_image_filenames?: string
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    return row as CSVRow
  })
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function constructImageUrl(filename: string): string {
  return `https://bjqadhzkoxdwyfsglrvq.supabase.co/storage/v1/object/public/imager/${filename}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = 'https://bjqadhzkoxdwyfsglrvq.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting data import process...')

    // Fetch CSV from data bucket
    const csvUrl = 'https://bjqadhzkoxdwyfsglrvq.supabase.co/storage/v1/object/public/data/products_data.csv'
    const csvResponse = await fetch(csvUrl)
    
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`)
    }

    const csvText = await csvResponse.text()
    const csvData = parseCSV(csvText)
    
    console.log(`Parsed ${csvData.length} products from CSV`)

    let categoriesProcessed = 0
    let productsProcessed = 0
    const categoryCache = new Map<string, string>() // name -> id mapping

    for (const row of csvData) {
      try {
        // Process category
        let categoryId = categoryCache.get(row.category_name)
        
        if (!categoryId) {
          const categorySlug = generateSlug(row.category_name)
          
          // Check if category exists
          const { data: existingCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single()

          if (existingCategory) {
            categoryId = existingCategory.id
          } else {
            // Create new category
            const { data: newCategory, error: categoryError } = await supabase
              .from('categories')
              .insert({
                name: row.category_name,
                slug: categorySlug,
                description: `Products in ${row.category_name} category`
              })
              .select('id')
              .single()

            if (categoryError) {
              console.error('Error creating category:', categoryError)
              continue
            }

            categoryId = newCategory.id
            categoriesProcessed++
          }
          
          categoryCache.set(row.category_name, categoryId)
        }

        // Process product images
        const mainImageUrl = constructImageUrl(row.main_image_filename)
        const imageUrls: string[] = []
        
        if (row.additional_image_filenames) {
          const additionalFilenames = row.additional_image_filenames
            .split(';')
            .map(f => f.trim())
            .filter(f => f.length > 0)
          
          imageUrls.push(...additionalFilenames.map(constructImageUrl))
        }

        // Process product
        const productSlug = generateSlug(row.name)
        const price = parseFloat(row.price.replace(/[^0-9.]/g, ''))
        const stockQuantity = parseInt(row.stock_quantity) || 0

        const { error: productError } = await supabase
          .from('products')
          .insert({
            name: row.name,
            slug: productSlug,
            description: row.description,
            price: price,
            sku: row.sku || null,
            stock_quantity: stockQuantity,
            manufacturer: row.manufacturer || null,
            category_id: categoryId,
            main_image_url: mainImageUrl,
            image_urls: imageUrls,
            is_published: true
          })

        if (productError) {
          console.error('Error creating product:', productError)
          continue
        }

        productsProcessed++
        
      } catch (error) {
        console.error('Error processing row:', error, row)
      }
    }

    const result = {
      success: true,
      message: `Import completed successfully`,
      stats: {
        categoriesProcessed,
        productsProcessed,
        totalRowsInCSV: csvData.length
      }
    }

    console.log('Import completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Import error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  }
})