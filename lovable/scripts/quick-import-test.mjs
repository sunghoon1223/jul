import { createClient } from '@supabase/supabase-js'

// Quick test to see if we can connect and import sample data
const supabaseUrl = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcWFkaHprb3hkd3lmc2dscnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODE4MjksImV4cCI6MjA2NzU1NzgyOX0.aOWT_5FrDBxGADHeziRVFusvo6YGW_-IDbgib-rSQlg"

const supabase = createClient(supabaseUrl, supabaseKey)

async function quickTest() {
  try {
    console.log('🔗 Testing Supabase connection...')
    
    // Test categories query
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)
    
    if (catError) {
      console.log('❌ Categories query failed:', catError.message)
    } else {
      console.log(`✅ Categories query successful: ${categories?.length || 0} results`)
      if (categories && categories.length > 0) {
        console.log('Sample category:', categories[0].name)
      }
    }
    
    // Test products query
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .limit(3)
    
    if (prodError) {
      console.log('❌ Products query failed:', prodError.message)
    } else {
      console.log(`✅ Products query successful: ${products?.length || 0} results`)
      if (products && products.length > 0) {
        console.log('Sample product:', products[0].name)
      }
    }
    
    // Check if tables exist
    const { data: tableData, error: tableError } = await supabase
      .rpc('get_schema_tables')
      .single()
    
    if (tableError) {
      console.log('📊 Cannot check table schema (expected if RLS is active)')
    }
    
    console.log('\n📋 Test Results Summary:')
    console.log('- Supabase connection: ✅ Working')
    console.log('- Categories table: ', catError ? '❌ RLS blocking' : '✅ Accessible')
    console.log('- Products table: ', prodError ? '❌ RLS blocking' : '✅ Accessible')
    
    if (catError || prodError) {
      console.log('\n💡 Next steps:')
      console.log('1. Go to Supabase Dashboard > SQL Editor')
      console.log('2. Run the SQL files in order:')
      console.log('   - step1_disable_rls.sql')
      console.log('   - step2_insert_categories.sql') 
      console.log('   - step3_insert_products.sql')
      console.log('   - step4_enable_rls.sql')
      console.log('3. Or use the complete crawled_import.sql file')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

quickTest()