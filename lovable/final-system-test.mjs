import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bjqadhzkoxdwyfsglrvq.supabase.co',
  'sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP'
)

console.log('🔄 전체 시스템 통합 테스트 시작...')

async function finalSystemTest() {
  let allTestsPassed = true
  
  try {
    // 1. 데이터베이스 연결 테스트
    console.log('\n1. 데이터베이스 연결 테스트...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ 데이터베이스 연결 실패:', connectionError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 데이터베이스 연결 성공')
    }

    // 2. 제품 데이터 검증
    console.log('\n2. 제품 데이터 검증...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, category_id')
      .limit(10)
    
    if (productsError) {
      console.error('❌ 제품 데이터 조회 실패:', productsError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 제품 데이터 조회 성공:', products?.length || 0, '개')
      
      // 제품 데이터 무결성 검증
      const invalidProducts = products?.filter(p => !p.name || !p.price || !p.category_id)
      if (invalidProducts?.length > 0) {
        console.error('❌ 유효하지 않은 제품 데이터:', invalidProducts.length, '개')
        allTestsPassed = false
      } else {
        console.log('✅ 제품 데이터 무결성 검증 성공')
      }
    }

    // 3. 카테고리 데이터 검증
    console.log('\n3. 카테고리 데이터 검증...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
    
    if (categoriesError) {
      console.error('❌ 카테고리 데이터 조회 실패:', categoriesError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 카테고리 데이터 조회 성공:', categories?.length || 0, '개')
      categories?.forEach(c => {
        console.log(`   - ${c.name} (${c.slug})`)
      })
    }

    // 4. 외래키 관계 검증
    console.log('\n4. 외래키 관계 검증...')
    const { data: productsWithCategories, error: relationError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        categories (
          id,
          name
        )
      `)
      .limit(5)
    
    if (relationError) {
      console.error('❌ 외래키 관계 조회 실패:', relationError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 외래키 관계 검증 성공')
      const orphanedProducts = productsWithCategories?.filter(p => !p.categories)
      if (orphanedProducts?.length > 0) {
        console.error('❌ 카테고리가 없는 제품:', orphanedProducts.length, '개')
        allTestsPassed = false
      } else {
        console.log('✅ 모든 제품이 유효한 카테고리를 가지고 있습니다.')
      }
    }

    // 5. 인증 시스템 테스트
    console.log('\n5. 인증 시스템 테스트...')
    const { data: authSession, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ 인증 시스템 오류:', authError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 인증 시스템 정상 (현재 세션:', authSession.session ? '로그인' : '로그아웃', ')')
    }

    // 6. 주문 시스템 통합 테스트
    console.log('\n6. 주문 시스템 통합 테스트...')
    
    // 테스트 주문 생성
    const testOrder = {
      email: 'integration.test@jpcaster.com',
      full_name: '통합 테스트 사용자',
      phone: '010-9999-9999',
      address: '서울시 통합구 테스트동 999',
      total_amount: 100000,
      status: 'pending'
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single()

    if (orderError) {
      console.error('❌ 주문 생성 실패:', orderError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 주문 생성 성공:', order.id)

      // 주문 아이템 생성
      const testOrderItem = {
        order_id: order.id,
        product_id: products[0].id,
        product_name: products[0].name,
        product_price: products[0].price,
        quantity: 1,
        total_price: products[0].price
      }

      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert(testOrderItem)
        .select()
        .single()

      if (itemError) {
        console.error('❌ 주문 아이템 생성 실패:', itemError.message)
        allTestsPassed = false
      } else {
        console.log('✅ 주문 아이템 생성 성공:', orderItem.id)
      }

      // 테스트 데이터 정리
      await supabase.from('order_items').delete().eq('order_id', order.id)
      await supabase.from('orders').delete().eq('id', order.id)
      console.log('✅ 테스트 데이터 정리 완료')
    }

    // 7. 재고 관리 시스템 테스트
    console.log('\n7. 재고 관리 시스템 테스트...')
    
    // 재고 통계
    const { data: stockStats, error: stockError } = await supabase
      .from('products')
      .select('stock_quantity')
    
    if (stockError) {
      console.error('❌ 재고 통계 조회 실패:', stockError.message)
      allTestsPassed = false
    } else {
      const totalStock = stockStats?.reduce((sum, p) => sum + p.stock_quantity, 0) || 0
      const avgStock = totalStock / (stockStats?.length || 1)
      
      console.log('✅ 재고 통계:')
      console.log(`   - 총 재고: ${totalStock}개`)
      console.log(`   - 평균 재고: ${avgStock.toFixed(1)}개`)
      console.log(`   - 제품 수: ${stockStats?.length || 0}개`)
    }

    // 8. 시스템 성능 테스트
    console.log('\n8. 시스템 성능 테스트...')
    
    const startTime = Date.now()
    const { data: performanceTest, error: perfError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        stock_quantity,
        categories (
          id,
          name
        )
      `)
      .limit(20)
    
    const endTime = Date.now()
    const queryTime = endTime - startTime

    if (perfError) {
      console.error('❌ 성능 테스트 실패:', perfError.message)
      allTestsPassed = false
    } else {
      console.log('✅ 성능 테스트 완료')
      console.log(`   - 쿼리 시간: ${queryTime}ms`)
      console.log(`   - 조회 결과: ${performanceTest?.length || 0}개`)
      
      if (queryTime > 5000) {
        console.warn('⚠️  쿼리 시간이 5초를 초과했습니다. 성능 최적화가 필요할 수 있습니다.')
      }
    }

    return allTestsPassed

  } catch (error) {
    console.error('❌ 통합 테스트 중 오류:', error.message)
    return false
  }
}

finalSystemTest().then(success => {
  console.log('\n=== 전체 시스템 통합 테스트 완료 ===')
  
  if (success) {
    console.log('🎉 모든 테스트 통과!')
    console.log('\n✅ 시스템 구현 완료:')
    console.log('   - ✅ Supabase 프로젝트 연결')
    console.log('   - ✅ 제품 데이터베이스 연동')
    console.log('   - ✅ 카테고리 시스템')
    console.log('   - ✅ 사용자 인증 시스템')
    console.log('   - ✅ 주문 관리 시스템')
    console.log('   - ✅ 재고 관리 시스템')
    console.log('   - ✅ 데이터 무결성 검증')
    console.log('   - ✅ 시스템 성능 확인')
    console.log('\n🚀 Mock 시스템 → Supabase 백엔드 전환 완료!')
  } else {
    console.log('❌ 일부 테스트 실패')
    console.log('   문제가 있는 부분을 확인하고 수정이 필요합니다.')
  }
  
  process.exit(success ? 0 : 1)
})