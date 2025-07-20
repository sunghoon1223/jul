import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🔐 Supabase Auth 테스트 시작...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  try {
    // 1. 현재 세션 확인
    console.log('\n1. 현재 세션 확인...')
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 세션 오류:', sessionError.message)
    } else {
      console.log('✅ 세션 상태:', session.session ? '로그인됨' : '로그아웃됨')
      if (session.session) {
        console.log('   사용자:', session.session.user.email)
      }
    }
    
    // 2. 사용자 테이블 확인
    console.log('\n2. 사용자 테이블 확인...')
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (userError) {
      console.log('⚠️  Profiles 테이블 오류 (정상 - 아직 생성 안됨):', userError.message)
    } else {
      console.log('✅ Profiles 테이블 존재, 사용자 수:', users?.length || 0)
    }
    
    // 3. Auth 설정 확인
    console.log('\n3. Auth 설정 확인...')
    const { data: config, error: configError } = await supabase.auth.getUser()
    
    if (configError) {
      console.log('⚠️  Auth 설정:', configError.message)
    } else {
      console.log('✅ Auth 설정 정상')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Auth 테스트 중 오류:', error.message)
    return false
  }
}

testAuth().then(success => {
  console.log('\n=== Auth 테스트 완료 ===')
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
})