#!/usr/bin/env node

// Supabase API를 통한 SQL 실행
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcWFkaHprb3hkd3lmc2dscnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODE4MjksImV4cCI6MjA2NzU1NzgyOX0.aOWT_5FrDBxGADHeziRVFusvo6YGW_-IDbgib-rSQlg"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function applySqlMigration() {
  console.log('🚀 Applying SQL migration via Supabase API...')
  
  try {
    // 1. SQL 파일 읽기
    const sqlPath = path.join(__dirname, '../supabase/migrations/20250717120000-fix-rls-and-insert-data.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📋 SQL migration file loaded')
    console.log(`📊 File size: ${sqlContent.length} characters`)
    
    // 2. SQL을 개별 명령어로 분할
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`🔧 Found ${sqlCommands.length} SQL commands`)
    
    // 3. 각 명령어를 순차적으로 실행
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      
      // 빈 명령어나 주석 건너뛰기
      if (!command || command.startsWith('--') || command.startsWith('/*')) {
        continue
      }
      
      try {
        console.log(`\n📝 Executing command ${i + 1}/${sqlCommands.length}...`)
        console.log(`   ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`)
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        })
        
        if (error) {
          console.error(`❌ Command ${i + 1} failed:`, error.message)
          errorCount++
        } else {
          console.log(`✅ Command ${i + 1} successful`)
          successCount++
        }
        
        // 서버 부하 방지
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Command ${i + 1} error:`, error.message)
        errorCount++
      }
    }
    
    // 4. 결과 보고
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successful commands: ${successCount}`)
    console.log(`❌ Failed commands: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
    } else {
      console.log('\n⚠️ Migration completed with some errors')
    }
    
    // 5. 데이터 검증
    console.log('\n🔍 Verifying migration results...')
    
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
      
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
      
      if (!catError && !prodError) {
        console.log(`📊 Categories in database: ${categories?.length || 0}`)
        console.log(`📊 Products in database: ${products?.length || 0}`)
        
        if (categories && categories.length > 0) {
          console.log(`   Sample category: ${categories[0].name}`)
        }
        
        if (products && products.length > 0) {
          console.log(`   Sample product: ${products[0].name}`)
        }
      } else {
        console.warn('⚠️ Could not verify data (RLS may still be blocking)')
      }
    } catch (verifyError) {
      console.warn('⚠️ Data verification failed:', verifyError.message)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// 스크립트 실행
applySqlMigration().catch(console.error)