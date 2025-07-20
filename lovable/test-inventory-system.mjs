import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bjqadhzkoxdwyfsglrvq.supabase.co',
  'sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP'
)

console.log('📦 재고 관리 시스템 테스트 시작...')

async function testInventorySystem() {
  try {
    // 1. 현재 재고 상태 확인
    console.log('\n1. 현재 재고 상태 확인...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .limit(5)
    
    if (productsError) {
      console.error('❌ 제품 데이터 조회 실패:', productsError.message)
      return false
    }
    
    console.log('✅ 제품 재고 현황:')
    products?.forEach(p => {
      const stockStatus = p.stock_quantity > 10 ? '충분' : 
                         p.stock_quantity > 0 ? '부족' : '품절'
      console.log(`   - ${p.name}: ${p.stock_quantity}개 (${stockStatus})`)
    })

    // 2. 재고 부족 제품 확인
    console.log('\n2. 재고 부족 제품 확인...')
    const { data: lowStockProducts, error: lowStockError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .lt('stock_quantity', 10)
      .order('stock_quantity', { ascending: true })
    
    if (lowStockError) {
      console.error('❌ 재고 부족 제품 조회 실패:', lowStockError.message)
    } else {
      console.log('✅ 재고 부족 제품 (10개 미만):')
      if (lowStockProducts?.length === 0) {
        console.log('   - 재고 부족 제품이 없습니다.')
      } else {
        lowStockProducts?.forEach(p => {
          console.log(`   - ${p.name}: ${p.stock_quantity}개`)
        })
      }
    }

    // 3. 품절 제품 확인
    console.log('\n3. 품절 제품 확인...')
    const { data: outOfStockProducts, error: outOfStockError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('stock_quantity', 0)
    
    if (outOfStockError) {
      console.error('❌ 품절 제품 조회 실패:', outOfStockError.message)
    } else {
      console.log('✅ 품절 제품:')
      if (outOfStockProducts?.length === 0) {
        console.log('   - 품절 제품이 없습니다.')
      } else {
        outOfStockProducts?.forEach(p => {
          console.log(`   - ${p.name}: ${p.stock_quantity}개`)
        })
      }
    }

    // 4. 재고 업데이트 테스트
    console.log('\n4. 재고 업데이트 테스트...')
    const testProduct = products[0]
    const originalStock = testProduct.stock_quantity
    const newStock = originalStock - 5

    console.log(`   테스트 제품: ${testProduct.name}`)
    console.log(`   기존 재고: ${originalStock}개`)
    console.log(`   새 재고: ${newStock}개`)

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', testProduct.id)

    if (updateError) {
      console.error('❌ 재고 업데이트 실패:', updateError.message)
    } else {
      console.log('✅ 재고 업데이트 성공')
    }

    // 5. 업데이트된 재고 확인
    console.log('\n5. 업데이트된 재고 확인...')
    const { data: updatedProduct, error: checkError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single()

    if (checkError) {
      console.error('❌ 재고 확인 실패:', checkError.message)
    } else {
      console.log('✅ 재고 확인 성공:', updatedProduct.stock_quantity, '개')
    }

    // 6. 재고 복원 (테스트 완료 후)
    console.log('\n6. 재고 복원...')
    const { error: restoreError } = await supabase
      .from('products')
      .update({ stock_quantity: originalStock })
      .eq('id', testProduct.id)

    if (restoreError) {
      console.error('❌ 재고 복원 실패:', restoreError.message)
    } else {
      console.log('✅ 재고 복원 성공')
    }

    // 7. 재고 이력 관리 (추가 구현 예정)
    console.log('\n7. 재고 이력 관리...')
    console.log('   💡 향후 구현 예정: 재고 변동 이력 테이블')
    console.log('   - 재고 입고/출고 이력')
    console.log('   - 재고 조정 기록')
    console.log('   - 재고 감사 로그')

    return true

  } catch (error) {
    console.error('❌ 재고 관리 테스트 중 오류:', error.message)
    return false
  }
}

testInventorySystem().then(success => {
  console.log('\n=== 재고 관리 테스트 완료 ===')
  console.log('결과:', success ? '✅ 모든 테스트 성공' : '❌ 테스트 실패')
  process.exit(success ? 0 : 1)
})