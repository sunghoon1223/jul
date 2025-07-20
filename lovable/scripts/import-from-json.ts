import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and Anon Key must be provided via environment variables')
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or SUPABASE_URL and SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importFromJson() {
  try {
    console.log('Starting JSON import to Supabase...')
    console.log(`Supabase URL: ${supabaseUrl}`)
    
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
      const categoryId = categoryMap.get(product.category?.id)
      
      if (!categoryId) {
        console.warn(`Warning: No category found for product ${product.product_name}, skipping...`)
        errorCount++
        continue
      }
      
      const productData = {
        name: product.product_name,
        slug: product.sku.toLowerCase(),
        description: product.long_description || product.short_description || '',
        price: parseFloat(product.regular_price) || 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        sku: product.sku,
        stock_quantity: product.stock_status === 'instock' ? 100 : 0, // Default stock
        stock_status: product.stock_status,
        weight: product.weight || null,
        dimensions: product.dimensions || null,
        manufacturer: null, // Not in current data
        category_id: categoryId,
        main_image_url: product.main_image_url,
        image_urls: product.image_urls || [],
        is_published: true,
        tags: product.tags ? product.tags.split(',').map(t => t.trim()) : []
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