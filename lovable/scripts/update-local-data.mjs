import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Update local data files with crawled data for better fallback
function updateLocalData() {
  try {
    console.log('🔄 Updating local data files with crawled data...')
    
    // Paths
    const crawledDataDir = path.join(__dirname, '../crawled_data')
    const srcDataDir = path.join(__dirname, '../src/data')
    
    const crawledCategoriesPath = path.join(crawledDataDir, 'categories.json')
    const crawledProductsPath = path.join(crawledDataDir, 'products.json')
    
    const localCategoriesPath = path.join(srcDataDir, 'categories.json')
    const localProductsPath = path.join(srcDataDir, 'products.json')
    
    // Check if crawled data exists
    if (!fs.existsSync(crawledCategoriesPath) || !fs.existsSync(crawledProductsPath)) {
      console.log('⚠️  Crawled data not found. Run "npm run crawl-jpcaster" first.')
      return
    }
    
    // Load crawled data
    const crawledCategories = JSON.parse(fs.readFileSync(crawledCategoriesPath, 'utf8'))
    const crawledProducts = JSON.parse(fs.readFileSync(crawledProductsPath, 'utf8'))
    
    console.log(`📂 Found ${crawledCategories.length} categories and ${crawledProducts.length} products`)
    
    // Transform categories for local use
    const transformedCategories = crawledCategories.map((cat, index) => ({
      id: cat.id || `cat_${index + 1}`,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      created_at: new Date().toISOString()
    }))
    
    // Transform products for local use - match expected structure
    const transformedProducts = crawledProducts.slice(0, 50).map((product, index) => ({
      id: product.id || `prod_${index + 1}`,
      name: product.name,
      slug: product.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100),
      description: product.description || `${product.name} from ${product.category} category manufactured by JP Caster.`,
      price: parseFloat(product.price) || 0,
      sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
      sku: product.sku,
      stock_quantity: parseInt(product.stock) || 100,
      stock_status: product.status === 'active' ? 'instock' : 'outofstock',
      weight: null,
      dimensions: null,
      manufacturer: 'JP Caster',
      main_image_url: product.originalImageUrl || '/images/placeholder.svg',
      image_urls: product.originalImageUrl ? [product.originalImageUrl] : ['/images/placeholder.svg'],
      is_published: true,
      tags: product.tags || [],
      source_url: product.productUrl || null,
      category_id: product.categoryId,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    // Create backup of existing files
    if (fs.existsSync(localCategoriesPath)) {
      fs.copyFileSync(localCategoriesPath, localCategoriesPath + '.backup')
    }
    if (fs.existsSync(localProductsPath)) {
      fs.copyFileSync(localProductsPath, localProductsPath + '.backup')
    }
    
    // Write updated files
    fs.writeFileSync(localCategoriesPath, JSON.stringify(transformedCategories, null, 2))
    fs.writeFileSync(localProductsPath, JSON.stringify(transformedProducts, null, 2))
    
    console.log('✅ Local data files updated successfully!')
    console.log(`📊 Updated ${transformedCategories.length} categories and ${transformedProducts.length} products`)
    console.log('💾 Backup files created with .backup extension')
    
  } catch (error) {
    console.error('❌ Error updating local data:', error)
  }
}

updateLocalData()