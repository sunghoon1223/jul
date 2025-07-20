#!/usr/bin/env node

// Supabase 데이터 마이그레이션 스크립트
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const SUPABASE_SERVICE_KEY = "sb_secret_RSJ16hYdT_wobIQnqKLzbQ_JwUPDlmP"

// Service role 키로 Supabase 클라이언트 생성 (RLS 우회)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrateData() {
  console.log('🚀 Starting Supabase data migration...')
  
  try {
    // 1. 카테고리 데이터 로드
    const categoriesPath = path.join(__dirname, '../src/data/categories.json')
    const productsPath = path.join(__dirname, '../src/data/products.json')
    
    if (!fs.existsSync(categoriesPath) || !fs.existsSync(productsPath)) {
      console.error('❌ Data files not found!')
      return
    }
    
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    console.log(`📊 Found ${categories.length} categories and ${products.length} products`)
    
    // 2. 기존 데이터 정리 (Service role 권한으로)
    console.log('🗑️ Cleaning existing data...')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log('✅ Existing data cleared')
    
    // 3. 카테고리 데이터 정리 (Supabase 스키마에 맞게)
    console.log('📝 Preparing categories for Supabase...')
    const cleanedCategories = categories.map(category => ({
      // ID 필드 제거하고 Supabase가 자동 생성하도록 함
      name: category.name,
      slug: category.slug,
      description: category.description
    }))
    
    console.log('📝 Inserting categories...')
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .upsert(cleanedCategories, { onConflict: 'slug' })
      .select()
    
    if (categoryError) {
      console.error('❌ Category insertion error:', categoryError)
      return
    }
    
    console.log(`✅ Successfully inserted ${categoryData.length} categories`)
    
    // 3. 카테고리 ID 매핑 생성 (구 ID -> 새 UUID)
    const categoryMapping = new Map()
    categories.forEach((oldCategory, index) => {
      if (categoryData[index]) {
        categoryMapping.set(oldCategory.id, categoryData[index].id)
      }
    })
    
    console.log('📝 Category mapping created:', Object.fromEntries(categoryMapping))
    
    // 4. 제품 데이터 준비 (배치 처리)
    console.log('📝 Preparing products for insertion...')
    
    const batchSize = 10  // 작은 배치로 시작
    let successCount = 0
    let errorCount = 0
    
    // 제품을 배치로 나누어 처리
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${batch.length} products)`)
      
      // 제품 데이터 형식 확인 및 정리
      const cleanedBatch = batch.map(product => {
        const newCategoryId = categoryMapping.get(product.category_id)
        if (!newCategoryId) {
          console.warn(`⚠️ Category not found for product ${product.name}, category_id: ${product.category_id}`)
          return null
        }
        
        return {
          // ID 필드 제거하고 Supabase가 자동 생성하도록 함
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          sku: product.sku,
          stock_quantity: parseInt(product.stock_quantity) || 0,
          manufacturer: product.manufacturer || '',
          is_published: product.is_published !== false,
          category_id: newCategoryId,
          main_image_url: product.main_image_url || '',
          image_urls: Array.isArray(product.image_urls) ? product.image_urls : [],
          features: typeof product.features === 'object' ? product.features : {}
        }
      }).filter(Boolean)  // null 값 제거
      
      const { data: productData, error: productError } = await supabase
        .from('products')
        .upsert(cleanedBatch, { onConflict: 'slug' })
        .select()
      
      if (productError) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} error:`, productError)
        errorCount += batch.length
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} successful: ${productData.length} products`)
        successCount += productData.length
      }
      
      // 서버 부하 방지를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 4. 결과 보고
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Categories: ${categoryData.length} inserted`)
    console.log(`✅ Products: ${successCount} successful`)
    if (errorCount > 0) {
      console.log(`❌ Products: ${errorCount} failed`)
    }
    
    // 5. 데이터 검증
    console.log('\n🔍 Verifying migration...')
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
    
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Database contains: ${categoryCount} categories, ${productCount} products`)
    
    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// 스크립트 실행
migrateData().catch(console.error)