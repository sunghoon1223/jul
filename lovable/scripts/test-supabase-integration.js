#!/usr/bin/env node

// Supabase 통합 테스트 스크립트
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcWFkaHprb3hkd3lmc2dscnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODE4MjksImV4cCI6MjA2NzU1NzgyOX0.aOWT_5FrDBxGADHeziRVFusvo6YGW_-IDbgib-rSQlg"

// Anon 키로 클라이언트 생성 (프론트엔드와 동일)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testIntegration() {
  console.log('🚀 Testing Supabase integration...')
  
  try {
    // 1. 연결 테스트
    console.log('\n🔌 Testing connection...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message)
      return
    }
    
    console.log('✅ Connection successful')
    
    // 2. 카테고리 조회 테스트
    console.log('\n📂 Testing categories query...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (catError) {
      console.error('❌ Categories query failed:', catError.message)
    } else {
      console.log(`✅ Categories loaded: ${categories?.length || 0} items`)
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.slug})`)
        })
      }
    }
    
    // 3. 제품 조회 테스트
    console.log('\n📦 Testing products query...')
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_published', true)
      .limit(5)
    
    if (prodError) {
      console.error('❌ Products query failed:', prodError.message)
    } else {
      console.log(`✅ Products loaded: ${products?.length || 0} items (showing first 5)`)
      if (products && products.length > 0) {
        products.forEach(prod => {
          console.log(`   - ${prod.name} (${prod.category?.name || 'No category'}) - $${prod.price}`)
        })
      }
    }
    
    // 4. 검색 테스트
    console.log('\n🔍 Testing search functionality...')
    const { data: searchResults, error: searchError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .or('name.ilike.%AGV%,description.ilike.%AGV%')
      .eq('is_published', true)
    
    if (searchError) {
      console.error('❌ Search query failed:', searchError.message)
    } else {
      console.log(`✅ Search results: ${searchResults?.length || 0} items found for "AGV"`)
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach(prod => {
          console.log(`   - ${prod.name}`)
        })
      }
    }
    
    // 5. 카테고리별 필터링 테스트
    console.log('\n🏷️ Testing category filtering...')
    const { data: categoryProducts, error: filterError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('categories.slug', 'agv-casters')
      .eq('is_published', true)
    
    if (filterError) {
      console.error('❌ Category filtering failed:', filterError.message)
    } else {
      console.log(`✅ AGV products: ${categoryProducts?.length || 0} items`)
    }
    
    // 6. Storage 테스트
    console.log('\n🖼️ Testing Storage URLs...')
    try {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl('ABUIABACGAAg1KHDoQYousOAODCgBjigBg.jpg')
      
      console.log('✅ Storage URL generated:', publicUrlData.publicUrl)
    } catch (storageError) {
      console.error('❌ Storage test failed:', storageError.message)
    }
    
    // 7. 성능 테스트
    console.log('\n⚡ Testing query performance...')
    const startTime = Date.now()
    
    const { data: perfTest, error: perfError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    const endTime = Date.now()
    const queryTime = endTime - startTime
    
    if (perfError) {
      console.error('❌ Performance test failed:', perfError.message)
    } else {
      console.log(`✅ Full products query completed in ${queryTime}ms`)
      console.log(`📊 Total products: ${perfTest?.length || 0}`)
    }
    
    console.log('\n🎉 Supabase integration test completed!')
    
    // 요약 보고서
    console.log('\n📋 Integration Summary:')
    console.log(`📂 Categories: ${categories?.length || 0}`)
    console.log(`📦 Products: ${perfTest?.length || 0}`)
    console.log(`🔍 Search working: ${searchResults ? 'Yes' : 'No'}`)
    console.log(`🏷️ Filtering working: ${categoryProducts ? 'Yes' : 'No'}`)
    console.log(`🖼️ Storage working: ${publicUrlData ? 'Yes' : 'No'}`)
    console.log(`⚡ Query performance: ${queryTime}ms`)
    
  } catch (error) {
    console.error('❌ Integration test failed:', error)
  }
}

// 스크립트 실행
testIntegration().catch(console.error)