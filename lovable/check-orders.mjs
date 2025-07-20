import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bjqadhzkoxdwyfsglrvq.supabase.co',
  'sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP'
)

console.log('🛒 주문 시스템 테이블 확인...')

async function checkOrderTables() {
  try {
    // 1. Orders 테이블 확인
    console.log('\n1. Orders 테이블 확인...')
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
    
    if (ordersError) {
      console.log('⚠️  Orders 테이블 오류:', ordersError.message)
    } else {
      console.log('✅ Orders 테이블 존재')
      console.log('   컬럼:', Object.keys(orders[0] || {}))
    }

    // 2. Order Items 테이블 확인
    console.log('\n2. Order Items 테이블 확인...')
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1)
    
    if (itemsError) {
      console.log('⚠️  Order Items 테이블 오류:', itemsError.message)
    } else {
      console.log('✅ Order Items 테이블 존재')
      console.log('   컬럼:', Object.keys(orderItems[0] || {}))
    }

    // 3. Carts 테이블 확인
    console.log('\n3. Carts 테이블 확인...')
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .limit(1)
    
    if (cartsError) {
      console.log('⚠️  Carts 테이블 오류:', cartsError.message)
    } else {
      console.log('✅ Carts 테이블 존재')
      console.log('   컬럼:', Object.keys(carts[0] || {}))
    }

    // 4. Cart Items 테이블 확인
    console.log('\n4. Cart Items 테이블 확인...')
    const { data: cartItems, error: cartItemsError } = await supabase
      .from('cart_items')
      .select('*')
      .limit(1)
    
    if (cartItemsError) {
      console.log('⚠️  Cart Items 테이블 오류:', cartItemsError.message)
    } else {
      console.log('✅ Cart Items 테이블 존재')
      console.log('   컬럼:', Object.keys(cartItems[0] || {}))
    }

  } catch (error) {
    console.error('❌ 주문 테이블 확인 중 오류:', error.message)
  }
}

checkOrderTables()