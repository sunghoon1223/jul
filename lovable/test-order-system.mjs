import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bjqadhzkoxdwyfsglrvq.supabase.co',
  'sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP'
)

console.log('🛒 주문 시스템 테스트 시작...')

async function testOrderSystem() {
  try {
    // 1. 제품 데이터 확인
    console.log('\n1. 제품 데이터 확인...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .limit(3)
    
    if (productsError) {
      console.error('❌ 제품 데이터 조회 실패:', productsError.message)
      return
    }
    
    console.log('✅ 제품 데이터:', products?.length || 0, '개')
    products?.forEach(p => {
      console.log(`   - ${p.name}: ${p.price}원 (재고: ${p.stock_quantity})`)
    })

    // 2. 테스트 주문 생성
    console.log('\n2. 테스트 주문 생성...')
    const testOrder = {
      email: 'test@jpcaster.com',
      full_name: '테스트 사용자',
      phone: '010-1234-5678',
      address: '서울시 강남구 테스트로 123',
      total_amount: products[0].price * 2,
      user_id: null
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single()

    if (orderError) {
      console.error('❌ 주문 생성 실패:', orderError.message)
      return
    }

    console.log('✅ 주문 생성 성공:', order.id)

    // 3. 주문 아이템 생성
    console.log('\n3. 주문 아이템 생성...')
    const testOrderItem = {
      order_id: order.id,
      product_id: products[0].id,
      product_name: products[0].name,
      product_price: products[0].price,
      quantity: 2,
      total_price: products[0].price * 2
    }

    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert(testOrderItem)
      .select()
      .single()

    if (itemError) {
      console.error('❌ 주문 아이템 생성 실패:', itemError.message)
    } else {
      console.log('✅ 주문 아이템 생성 성공:', orderItem.id)
    }

    // 4. 주문 조회
    console.log('\n4. 주문 조회...')
    const { data: orderWithItems, error: queryError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single()

    if (queryError) {
      console.error('❌ 주문 조회 실패:', queryError.message)
    } else {
      console.log('✅ 주문 조회 성공:')
      console.log(`   주문번호: ${orderWithItems.id}`)
      console.log(`   고객명: ${orderWithItems.full_name}`)
      console.log(`   총액: ${orderWithItems.total_amount}원`)
      console.log(`   상태: ${orderWithItems.status}`)
      console.log(`   아이템 수: ${orderWithItems.order_items?.length || 0}개`)
    }

    // 5. 주문 상태 업데이트
    console.log('\n5. 주문 상태 업데이트...')
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id)

    if (updateError) {
      console.error('❌ 주문 상태 업데이트 실패:', updateError.message)
    } else {
      console.log('✅ 주문 상태 업데이트 성공: pending → confirmed')
    }

    // 6. 정리 (테스트 데이터 삭제)
    console.log('\n6. 테스트 데이터 정리...')
    await supabase.from('order_items').delete().eq('order_id', order.id)
    await supabase.from('orders').delete().eq('id', order.id)
    console.log('✅ 테스트 데이터 정리 완료')

    return true

  } catch (error) {
    console.error('❌ 주문 시스템 테스트 중 오류:', error.message)
    return false
  }
}

testOrderSystem().then(success => {
  console.log('\n=== 주문 시스템 테스트 완료 ===')
  console.log('결과:', success ? '✅ 모든 테스트 성공' : '❌ 테스트 실패')
  process.exit(success ? 0 : 1)
})