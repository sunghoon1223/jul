import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and Key must be provided via environment variables')
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for full access)')
  process.exit(1)
}

console.log('Using key type:', supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9') ? 'Anonymous Key' : 'Service Role Key')

const supabase = createClient(supabaseUrl, supabaseKey)

async function importFromJson() {
  try {
    console.log('Starting JSON import to Supabase...')
    console.log(`Supabase URL: ${supabaseUrl}`)
    
    // Test connection first
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    if (error) {
      console.error('Connection test failed:', error)
      console.error('Please check your Supabase configuration and make sure the database is running')
      process.exit(1)
    }
    console.log('✓ Connection to Supabase successful')
    
    // Read products.json
    const productsPath = path.join(__dirname, '../src/data/products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    console.log(`Found ${productsData.length} products to import`)
    
    // Read categories.json
    const categoriesPath = path.join(__dirname, '../src/data/categories.json')
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    console.log(`Found ${categoriesData.length} categories to import`)
    
    // Import categories first
    console.log('Importing categories...')
    const categoryMap = new Map()
    
    for (const category of categoriesData) {
      const { data, error } = await supabase
        .from('categories')
        .upsert({
          name: category.name,
          slug: category.slug,
          description: category.description || `Products in the ${category.name} category`
        }, { onConflict: 'slug' })
        .select('id, slug')
        .single()
      
      if (error) {
        console.error(`Error importing category ${category.name}:`, error)
        if (error.code === '42501') {
          console.error('\n🚨 RLS (Row Level Security) Policy Error Detected!')
          console.error('This error occurs because the current key does not have permission to insert data.')
          console.error('\nSolutions:')
          console.error('1. Use Service Role Key instead of Anonymous Key')
          console.error('2. Disable RLS temporarily in Supabase Dashboard')
          console.error('3. Create RLS policies that allow inserts for this operation')
          console.error('\nTo get your Service Role Key:')
          console.error('- Go to Supabase Dashboard > Settings > API')
          console.error('- Copy the "service_role" key (NOT the anon/public key)')
          console.error('- Set it as SUPABASE_SERVICE_ROLE_KEY environment variable')
          console.error('\nTo disable RLS temporarily:')
          console.error('- Go to Supabase Dashboard > Authentication > Policies')
          console.error('- Find the "categories" table and disable RLS')
          console.error('- Re-enable it after import completes')
          process.exit(1)
        }
        continue
      }
      
      if (data) {
        categoryMap.set(category.id, data.id)
        console.log(`✓ Imported category: ${category.name}`)
      }
    }
    
    // Import products
    console.log('\nImporting products...')
    let successCount = 0
    let errorCount = 0
    
    for (const product of productsData) {
      // Get the Supabase category ID
      const categoryId = categoryMap.get(product.category_id)
      
      if (!categoryId) {
        console.warn(`Warning: No category found for product ${product.name}, skipping...`)
        errorCount++
        continue
      }
      
      const productData = {
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        sku: product.sku,
        stock_quantity: product.stock_quantity || 0,
        manufacturer: product.manufacturer || null,
        category_id: categoryId,
        main_image_url: product.main_image_url,
        image_urls: product.image_urls || [],
        is_published: product.is_published !== false,
        features: product.features || null
      }
      
      const { error } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'sku' })
      
      if (error) {
        console.error(`Error importing product ${product.product_name}:`, error)
        errorCount++
      } else {
        successCount++
        if (successCount % 10 === 0) {
          console.log(`✓ Imported ${successCount} products...`)
        }
      }
    }
    
    console.log('\n=== Import Summary ===')
    console.log(`Categories imported: ${categoryMap.size}`)
    console.log(`Products imported successfully: ${successCount}`)
    console.log(`Products failed: ${errorCount}`)
    console.log(`Total products processed: ${successCount + errorCount}`)
    
  } catch (error) {
    console.error('Fatal error during import:', error)
    process.exit(1)
  }
}

// Run the import
importFromJson()