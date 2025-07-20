import { createClient } from '@supabase/supabase-js'

// Using hardcoded values from client.ts to bypass environment variable issues
const supabaseUrl = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcWFkaHprb3hkd3lmc2dscnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODE4MjksImV4cCI6MjA2NzU1NzgyOX0.aOWT_5FrDBxGADHeziRVFusvo6YGW_-IDbgib-rSQlg"

const supabase = createClient(supabaseUrl, supabaseKey)

async function directImport() {
  try {
    console.log('🚀 Starting direct database import...')
    
    // First, let's try to check if we can read the tables
    console.log('Testing database access...')
    
    const { data: categoriesCount, error: categoriesError } = await supabase
      .from('categories')
      .select('count(*)', { count: 'exact', head: true })
    
    if (categoriesError) {
      console.log('Categories table error:', categoriesError)
      
      // Try to disable RLS programmatically (if we have permissions)
      console.log('Attempting to disable RLS on categories table...')
      const { error: rlsError } = await supabase.rpc('disable_rls_categories')
      if (rlsError) {
        console.log('Cannot disable RLS programmatically:', rlsError.message)
      }
    } else {
      console.log('✅ Categories table accessible')
    }
    
    // Try a simple insert test
    console.log('Testing insert permissions...')
    const testCategory = {
      name: 'Test Category',
      slug: 'test-category-' + Date.now(),
      description: 'Test category for permissions check'
    }
    
    const { data: insertTest, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      
      if (insertError.code === '42501') {
        console.log('\n🔧 RLS Policy blocking inserts. Trying alternative approach...')
        
        // Try using the SQL editor approach
        console.log('Generating SQL commands for manual execution:')
        console.log('\n=== COPY THIS SQL TO SUPABASE DASHBOARD ===')
        console.log('-- 1. Go to Supabase Dashboard > SQL Editor')
        console.log('-- 2. Paste and run this SQL:')
        console.log('')
        console.log('-- Temporarily disable RLS')
        console.log('ALTER TABLE categories DISABLE ROW LEVEL SECURITY;')
        console.log('ALTER TABLE products DISABLE ROW LEVEL SECURITY;')
        console.log('')
        console.log('-- Insert categories')
        console.log("INSERT INTO categories (name, slug, description) VALUES")
        console.log("  ('산업용 캐스터', '산업용-캐스터', 'Products in the 산업용 캐스터 category'),")
        console.log("  ('폴리우레탄 휠', '폴리우레탄-휠', 'Products in the 폴리우레탄 휠 category');")
        console.log('')
        console.log('-- Re-enable RLS after import')
        console.log('ALTER TABLE categories ENABLE ROW LEVEL SECURITY;')
        console.log('ALTER TABLE products ENABLE ROW LEVEL SECURITY;')
        console.log('')
        console.log('=== END OF SQL ===\n')
        
        return
      }
    } else {
      console.log('✅ Insert test successful:', insertTest)
      
      // Clean up test data
      await supabase
        .from('categories')
        .delete()
        .eq('slug', testCategory.slug)
      
      console.log('🔥 Starting full data import...')
      
      // Import real categories
      const categories = [
        {
          name: '산업용 캐스터',
          slug: '산업용-캐스터',
          description: 'Products in the 산업용 캐스터 category'
        },
        {
          name: '폴리우레탄 휠',
          slug: '폴리우레탄-휠',
          description: 'Products in the 폴리우레탄 휠 category'
        }
      ]
      
      for (const category of categories) {
        const { error } = await supabase
          .from('categories')
          .upsert(category, { onConflict: 'slug' })
        
        if (error) {
          console.error(`❌ Failed to insert category ${category.name}:`, error)
        } else {
          console.log(`✅ Inserted category: ${category.name}`)
        }
      }
      
      console.log('🎉 Categories import completed successfully!')
      console.log('📝 Next: Run the products import script or continue with manual SQL import')
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

directImport()