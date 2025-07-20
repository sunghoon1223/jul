import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Supabase client
const supabaseUrl = "https://bjqadhzkoxdwyfsglrvq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcWFkaHprb3hkd3lmc2dscnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODE4MjksImV4cCI6MjA2NzU1NzgyOX0.aOWT_5FrDBxGADHeziRVFusvo6YGW_-IDbgib-rSQlg"

const supabase = createClient(supabaseUrl, supabaseKey)

class CrawledDataImporter {
  constructor() {
    this.dataDir = path.join(__dirname, '../crawled_data')
    this.categoriesPath = path.join(this.dataDir, 'categories.json')
    this.productsPath = path.join(this.dataDir, 'products.json')
  }
  
  async loadCrawledData() {
    try {
      console.log('📂 Loading crawled data...')
      
      // Check if files exist
      if (!fs.existsSync(this.categoriesPath)) {
        throw new Error(`Categories file not found: ${this.categoriesPath}`)
      }
      
      if (!fs.existsSync(this.productsPath)) {
        throw new Error(`Products file not found: ${this.productsPath}`)
      }
      
      // Load data
      const categories = JSON.parse(fs.readFileSync(this.categoriesPath, 'utf8'))
      const products = JSON.parse(fs.readFileSync(this.productsPath, 'utf8'))
      
      console.log(`✅ Loaded ${categories.length} categories and ${products.length} products`)
      
      return { categories, products }
      
    } catch (error) {
      console.error('❌ Error loading crawled data:', error)
      throw error
    }
  }
  
  transformForSupabase(categories, products) {
    console.log('🔄 Transforming data for Supabase...')
    
    // Transform categories
    const transformedCategories = categories.map((category, index) => ({
      name: category.name,
      slug: category.slug,
      description: category.description || `${category.name} from JP Caster`,
      source_url: category.url || null,
      is_active: true,
      created_at: new Date().toISOString()
    }))
    
    // Transform products
    const transformedProducts = products.map((product, index) => ({
      name: product.name,
      slug: this.createSlug(product.name + '-' + index),
      description: this.generateDescription(product),
      price: parseFloat(product.price) || 0,
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      sku: product.sku,
      stock_quantity: parseInt(product.stock) || 100,
      stock_status: product.status === 'active' ? 'instock' : 'outofstock',
      weight: null,
      dimensions: null,
      manufacturer: 'JP Caster',
      main_image_url: product.localImagePath || product.originalImageUrl,
      image_urls: product.localImagePath ? [product.localImagePath] : [],
      is_published: true,
      tags: this.extractTags(product),
      source_url: product.productUrl || null,
      category_name: product.category, // We'll use this to match categories
      created_at: product.created_at || new Date().toISOString()
    }))
    
    console.log(`✅ Transformed ${transformedCategories.length} categories and ${transformedProducts.length} products`)
    
    return { transformedCategories, transformedProducts }
  }
  
  createSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .slice(0, 100) // Limit length
  }
  
  generateDescription(product) {
    const parts = []
    
    if (product.name && product.name !== 'Product ' + product.index) {
      parts.push(product.name)
    }
    
    if (product.category) {
      parts.push(`from ${product.category} category`)
    }
    
    parts.push('manufactured by JP Caster')
    
    return parts.join(' ') + '.'
  }
  
  extractTags(product) {
    const tags = []
    
    if (product.category) {
      tags.push(product.category.toLowerCase())
    }
    
    // Extract tags from product name
    const name = product.name.toLowerCase()
    
    if (name.includes('caster')) tags.push('caster')
    if (name.includes('wheel')) tags.push('wheel')
    if (name.includes('mm')) tags.push('industrial')
    if (name.includes('heavy')) tags.push('heavy-duty')
    if (name.includes('light')) tags.push('light-duty')
    if (name.includes('swivel')) tags.push('swivel')
    if (name.includes('fixed')) tags.push('fixed')
    if (name.includes('brake')) tags.push('brake')
    
    return [...new Set(tags)] // Remove duplicates
  }
  
  async testConnection() {
    try {
      console.log('🔌 Testing Supabase connection...')
      
      const { data, error } = await supabase
        .from('categories')
        .select('count(*)', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Connection test failed:', error)
        return false
      }
      
      console.log('✅ Supabase connection successful')
      return true
      
    } catch (error) {
      console.error('❌ Connection error:', error)
      return false
    }
  }
  
  async importCategories(categories) {
    console.log(`📥 Importing ${categories.length} categories...`)
    
    const results = []
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i]
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .upsert(category, { onConflict: 'slug' })
          .select('id, name, slug')
          .single()
        
        if (error) {
          console.error(`❌ Failed to import category ${category.name}:`, error)
          
          if (error.code === '42501') {
            console.error('🚨 RLS Policy Error! Please run the SQL command in Supabase Dashboard:')
            console.error('ALTER TABLE categories DISABLE ROW LEVEL SECURITY;')
            console.error('ALTER TABLE products DISABLE ROW LEVEL SECURITY;')
            throw new Error('RLS Policy blocking imports')
          }
          
          results.push({ category: category.name, success: false, error: error.message })
        } else {
          console.log(`✅ Imported category: ${category.name}`)
          results.push({ 
            category: category.name, 
            success: true, 
            id: data.id,
            slug: data.slug 
          })
        }
        
      } catch (error) {
        console.error(`❌ Error importing category ${category.name}:`, error)
        results.push({ category: category.name, success: false, error: error.message })
      }
    }
    
    const successful = results.filter(r => r.success)
    console.log(`📊 Categories imported: ${successful.length}/${categories.length}`)
    
    return results
  }
  
  async importProducts(products, categoryResults) {
    console.log(`📥 Importing ${products.length} products...`)
    
    // Create category name to ID mapping
    const categoryMap = new Map()
    categoryResults.forEach(result => {
      if (result.success) {
        // Also get existing categories from database
        categoryMap.set(result.category, result.id)
      }
    })
    
    // Get existing categories from database
    try {
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id, name, slug')
      
      if (existingCategories) {
        existingCategories.forEach(cat => {
          categoryMap.set(cat.name, cat.id)
        })
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch existing categories:', error.message)
    }
    
    console.log(`📋 Category mapping: ${categoryMap.size} categories available`)
    
    const results = []
    let imported = 0
    let skipped = 0
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      // Find category ID
      const categoryId = categoryMap.get(product.category_name)
      
      if (!categoryId) {
        console.warn(`⚠️  No category found for product ${product.name}, skipping...`)
        skipped++
        continue
      }
      
      // Remove category_name and add category_id
      const { category_name, ...productData } = product
      productData.category_id = categoryId
      
      try {
        const { error } = await supabase
          .from('products')
          .upsert(productData, { onConflict: 'sku' })
        
        if (error) {
          console.error(`❌ Failed to import product ${product.name}:`, error)
          results.push({ product: product.name, success: false, error: error.message })
        } else {
          imported++
          if (imported % 10 === 0) {
            console.log(`✅ Imported ${imported} products...`)
          }
          results.push({ product: product.name, success: true })
        }
        
      } catch (error) {
        console.error(`❌ Error importing product ${product.name}:`, error)
        results.push({ product: product.name, success: false, error: error.message })
      }
    }
    
    console.log(`📊 Products imported: ${imported}/${products.length} (skipped: ${skipped})`)
    
    return results
  }
  
  async generateSQL(categories, products) {
    console.log('📝 Generating SQL for manual import...')
    
    let sql = '-- Crawled Data Import SQL\n'
    sql += '-- Execute in Supabase Dashboard > SQL Editor\n\n'
    
    // Disable RLS
    sql += '-- Disable RLS temporarily\n'
    sql += 'ALTER TABLE categories DISABLE ROW LEVEL SECURITY;\n'
    sql += 'ALTER TABLE products DISABLE ROW LEVEL SECURITY;\n\n'
    
    // Categories
    sql += '-- Insert categories\n'
    sql += 'INSERT INTO categories (name, slug, description, is_active) VALUES\n'
    
    const categoryValues = categories.map((cat, index) => {
      const name = cat.name.replace(/'/g, "''")
      const slug = cat.slug.replace(/'/g, "''") 
      const description = (cat.description || '').replace(/'/g, "''")
      const comma = index === categories.length - 1 ? ';' : ','
      return `  ('${name}', '${slug}', '${description}', true)${comma}`
    })
    
    sql += categoryValues.join('\n') + '\n\n'
    
    // Products (first 50 to avoid huge SQL)
    sql += '-- Insert first 50 products\n'
    sql += 'INSERT INTO products (name, slug, description, price, sku, stock_quantity, manufacturer, category_id, main_image_url, is_published, tags) VALUES\n'
    
    const limitedProducts = products.slice(0, 50)
    const productValues = limitedProducts.map((prod, index) => {
      const name = prod.name.replace(/'/g, "''")
      const slug = prod.slug.replace(/'/g, "''")
      const description = (prod.description || '').replace(/'/g, "''")
      const sku = prod.sku.replace(/'/g, "''")
      const manufacturer = (prod.manufacturer || '').replace(/'/g, "''")
      const imageUrl = prod.main_image_url ? `'${prod.main_image_url.replace(/'/g, "''")}'` : 'NULL'
      const tags = `ARRAY[${prod.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]`
      
      const comma = index === limitedProducts.length - 1 ? ';' : ','
      
      return `  ('${name}', '${slug}', '${description}', ${prod.price}, '${sku}', ${prod.stock_quantity}, '${manufacturer}', (SELECT id FROM categories WHERE name = '${prod.category_name.replace(/'/g, "''")}'), ${imageUrl}, true, '${tags}')${comma}`
    })
    
    sql += productValues.join('\n') + '\n\n'
    
    // Re-enable RLS
    sql += '-- Re-enable RLS\n'
    sql += 'ALTER TABLE categories ENABLE ROW LEVEL SECURITY;\n'
    sql += 'ALTER TABLE products ENABLE ROW LEVEL SECURITY;\n\n'
    
    // Verification
    sql += '-- Verify import\n'
    sql += 'SELECT \'Categories imported:\' as result, count(*) as count FROM categories;\n'
    sql += 'SELECT \'Products imported:\' as result, count(*) as count FROM products;\n'
    
    // Save SQL file
    const sqlPath = path.join(__dirname, '../crawled_import.sql')
    fs.writeFileSync(sqlPath, sql)
    
    console.log(`💾 SQL saved to: ${sqlPath}`)
    console.log(`📊 Generated SQL for ${categories.length} categories and ${limitedProducts.length} products`)
    
    return sqlPath
  }
  
  async run() {
    try {
      console.log('🚀 Starting crawled data import...')
      
      // Load data
      const { categories, products } = await this.loadCrawledData()
      
      // Transform data
      const { transformedCategories, transformedProducts } = this.transformForSupabase(categories, products)
      
      // Test connection
      const connected = await this.testConnection()
      
      if (!connected) {
        console.log('📝 Connection failed, generating SQL for manual import...')
        await this.generateSQL(transformedCategories, transformedProducts)
        return
      }
      
      // Try importing via API
      console.log('🔄 Attempting direct import via Supabase API...')
      
      const categoryResults = await this.importCategories(transformedCategories)
      const productResults = await this.importProducts(transformedProducts, categoryResults)
      
      // Summary
      const successfulCategories = categoryResults.filter(r => r.success).length
      const successfulProducts = productResults.filter(r => r.success).length
      
      console.log('\n🎉 Import Summary:')
      console.log(`📂 Categories: ${successfulCategories}/${transformedCategories.length}`)
      console.log(`📦 Products: ${successfulProducts}/${transformedProducts.length}`)
      
      if (successfulCategories === 0 || successfulProducts === 0) {
        console.log('\n📝 Generating SQL for manual import...')
        await this.generateSQL(transformedCategories, transformedProducts)
      }
      
    } catch (error) {
      console.error('❌ Import failed:', error)
      
      // Generate SQL as fallback
      try {
        const { categories, products } = await this.loadCrawledData()
        const { transformedCategories, transformedProducts } = this.transformForSupabase(categories, products)
        await this.generateSQL(transformedCategories, transformedProducts)
      } catch (sqlError) {
        console.error('❌ Could not generate SQL:', sqlError)
      }
    }
  }
}

// Run import
const importer = new CrawledDataImporter()
importer.run()