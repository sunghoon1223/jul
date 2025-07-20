import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bjqadhzkoxdwyfsglrvq.supabase.co',
  'sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP'
)

console.log('🔍 데이터베이스 스키마 확인...')

async function checkSchema() {
  try {
    // 1. Products 테이블 구조 확인
    console.log('\n1. Products 테이블 샘플 확인...')
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (prodError) {
      console.error('❌ Products 테이블 오류:', prodError.message)
    } else {
      console.log('✅ Products 테이블 컬럼:', Object.keys(products[0] || {}))
    }

    // 2. Categories 테이블 확인
    console.log('\n2. Categories 테이블 확인...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(3)
    
    if (catError) {
      console.error('❌ Categories 테이블 오류:', catError.message)
    } else {
      console.log('✅ Categories 테이블 데이터:', categories?.length || 0)
      categories?.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug})`)
      })
    }

    // 3. JSON 데이터 구조 확인
    console.log('\n3. JSON 제품 데이터 샘플 확인...')
    const fs = await import('fs')
    const productsJson = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'))
    
    console.log('✅ JSON 제품 컬럼:', Object.keys(productsJson[0] || {}))
    console.log('✅ JSON 제품 수:', productsJson.length)

  } catch (error) {
    console.error('❌ 스키마 확인 중 오류:', error.message)
  }
}

checkSchema()