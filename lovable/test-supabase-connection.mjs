import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase 연결 테스트 시작...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // 1. 기본 연결 테스트
    console.log('\n1. 기본 연결 테스트...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ 연결 실패:', healthError.message)
      return false
    }
    
    console.log('✅ Supabase 연결 성공!')
    
    // 2. 테이블 구조 확인
    console.log('\n2. 테이블 구조 확인...')
    
    // Categories 테이블 확인
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(3)
    
    if (catError) {
      console.log('⚠️  Categories 테이블 오류:', catError.message)
    } else {
      console.log('✅ Categories 테이블 존재, 데이터 수:', categories?.length || 0)
      if (categories?.length > 0) {
        console.log('   첫 번째 카테고리:', categories[0])
      }
    }
    
    // Products 테이블 확인
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(3)
    
    if (prodError) {
      console.log('⚠️  Products 테이블 오류:', prodError.message)
    } else {
      console.log('✅ Products 테이블 존재, 데이터 수:', products?.length || 0)
      if (products?.length > 0) {
        console.log('   첫 번째 제품:', products[0])
      }
    }
    
    // 3. 테이블 목록 확인
    console.log('\n3. 데이터베이스 테이블 목록 확인...')
    const { data: tables, error: tableError } = await supabase
      .rpc('get_table_list')
      .catch(async () => {
        // RPC 함수가 없으면 다른 방법으로 확인
        return await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
      })
    
    if (tables && !tableError) {
      console.log('✅ 테이블 목록:', tables.map(t => t.table_name || t))
    } else {
      console.log('⚠️  테이블 목록 조회 실패')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ 연결 테스트 중 오류 발생:', error.message)
    return false
  }
}

testConnection().then(success => {
  console.log('\n=== 연결 테스트 완료 ===')
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
})