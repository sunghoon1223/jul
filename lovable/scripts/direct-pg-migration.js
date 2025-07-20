#!/usr/bin/env node

// PostgreSQL 직접 접속을 통한 완전 마이그레이션
import pkg from 'pg'
const { Client } = pkg
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// PostgreSQL 직접 연결 설정 (IPv4 강제)
const connectionConfig = {
  user: 'postgres',
  password: 'Jj2478655!@',
  host: 'db.bjqadhzkoxdwyfsglrvq.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
}

async function directMigration() {
  console.log('🚀 Starting direct PostgreSQL migration...')
  
  const client = new Client(connectionConfig)
  
  try {
    // 1. 데이터베이스 연결
    console.log('🔌 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected to PostgreSQL successfully')
    
    // 2. 연결 및 권한 확인
    const result = await client.query('SELECT current_user, current_database(), version()')
    console.log('👤 Current user:', result.rows[0].current_user)
    console.log('🗄️ Current database:', result.rows[0].current_database)
    console.log('🔧 PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1])
    
    // 3. 기존 테이블 확인
    console.log('\n📋 Checking existing tables...')
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'products')
    `)
    console.log('📊 Existing tables:', tablesResult.rows.map(r => r.table_name))
    
    // 4. RLS 상태 확인
    const rlsResult = await client.query(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('categories', 'products')
    `)
    console.log('🔒 RLS status:')
    rlsResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`)
    })
    
    // 5. 임시로 RLS 비활성화 (슈퍼유저 권한)
    console.log('\n⚠️ Temporarily disabling RLS for migration...')
    await client.query('ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY')
    await client.query('ALTER TABLE public.products DISABLE ROW LEVEL SECURITY')
    console.log('✅ RLS disabled')
    
    // 6. 기존 데이터 정리 (필요시)
    console.log('\n🗑️ Cleaning existing data...')
    await client.query('DELETE FROM public.products')
    await client.query('DELETE FROM public.categories')
    console.log('✅ Existing data cleared')
    
    // 7. 카테고리 데이터 로드 및 삽입
    console.log('\n📝 Loading categories data...')
    const categoriesPath = path.join(__dirname, '../src/data/categories.json')
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    
    console.log(`📊 Found ${categories.length} categories`)
    
    // 카테고리 삽입 (UUID 자동 생성)
    for (const category of categories) {
      await client.query(`
        INSERT INTO public.categories (name, slug, description)
        VALUES ($1, $2, $3)
      `, [category.name, category.slug, category.description])
    }
    
    console.log('✅ Categories inserted successfully')
    
    // 8. 삽입된 카테고리 ID 매핑 생성
    const categoryMappingResult = await client.query(`
      SELECT id, slug FROM public.categories ORDER BY created_at
    `)
    
    const categoryMapping = new Map()
    categories.forEach((oldCategory, index) => {
      if (categoryMappingResult.rows[index]) {
        categoryMapping.set(oldCategory.id, categoryMappingResult.rows[index].id)
      }
    })
    
    console.log('🗺️ Category mapping created')
    
    // 9. 제품 데이터 로드 및 삽입
    console.log('\n📝 Loading products data...')
    const productsPath = path.join(__dirname, '../src/data/products.json')
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    console.log(`📊 Found ${products.length} products`)
    
    // 제품 배치 삽입
    let successCount = 0
    let errorCount = 0
    
    for (const product of products) {
      try {
        const newCategoryId = categoryMapping.get(product.category_id)
        if (!newCategoryId) {
          console.warn(`⚠️ Category not found for product: ${product.name}`)
          errorCount++
          continue
        }
        
        await client.query(`
          INSERT INTO public.products (
            name, slug, description, price, sku, stock_quantity, 
            manufacturer, is_published, category_id, main_image_url, 
            image_urls, features
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          product.name,
          product.slug,
          product.description || '',
          parseFloat(product.price) || 0,
          product.sku,
          parseInt(product.stock_quantity) || 0,
          product.manufacturer || '',
          product.is_published !== false,
          newCategoryId,
          product.main_image_url || '',
          product.image_urls || [],
          product.features || {}
        ])
        
        successCount++
        
      } catch (error) {
        console.error(`❌ Error inserting product ${product.name}:`, error.message)
        errorCount++
      }
    }
    
    console.log(`✅ Products migration completed: ${successCount} success, ${errorCount} errors`)
    
    // 10. RLS 다시 활성화
    console.log('\n🔒 Re-enabling RLS...')
    await client.query('ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY')
    await client.query('ALTER TABLE public.products ENABLE ROW LEVEL SECURITY')
    console.log('✅ RLS re-enabled')
    
    // 11. 데이터 검증
    console.log('\n🔍 Verifying migration...')
    const categoryCount = await client.query('SELECT COUNT(*) FROM public.categories')
    const productCount = await client.query('SELECT COUNT(*) FROM public.products')
    
    console.log(`📊 Final counts:`)
    console.log(`  Categories: ${categoryCount.rows[0].count}`)
    console.log(`  Products: ${productCount.rows[0].count}`)
    
    // 12. 샘플 데이터 확인
    console.log('\n👀 Sample data:')
    const sampleCategory = await client.query('SELECT name, slug FROM public.categories LIMIT 1')
    const sampleProduct = await client.query('SELECT name, price, category_id FROM public.products LIMIT 1')
    
    if (sampleCategory.rows.length > 0) {
      console.log(`  Sample category: ${sampleCategory.rows[0].name} (${sampleCategory.rows[0].slug})`)
    }
    
    if (sampleProduct.rows.length > 0) {
      console.log(`  Sample product: ${sampleProduct.rows[0].name} - $${sampleProduct.rows[0].price}`)
    }
    
    console.log('\n🎉 Direct PostgreSQL migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    // 연결 종료
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// 스크립트 실행
directMigration().catch(console.error)