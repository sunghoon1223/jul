import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class CrawledDataTransformer {
  constructor() {
    this.crawledDir = path.join(__dirname, '../crawled_data')
    this.targetDir = path.join(__dirname, '../src/data')
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
    
    if (product.name && !product.name.startsWith('Product ')) {
      parts.push(product.name)
    } else {
      parts.push('Professional caster product')
    }
    
    if (product.category) {
      parts.push(`from ${product.category} category`)
    }
    
    parts.push('manufactured by JP Caster')
    
    return parts.join(' ') + '.'
  }
  
  getLocalImagePath(product) {
    // Check if we have a local image that matches this product
    const imageDir = path.join(__dirname, '../public/images')
    const imageFiles = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'))
    
    // Use original image URL or fallback to first available image
    if (product.localImagePath) {
      return product.localImagePath
    }
    
    if (product.originalImageUrl && product.originalImageUrl.includes('ABUIABAEGAAg')) {
      // Extract the image filename from the original URL
      const match = product.originalImageUrl.match(/ABUIABAEGAAg[^.]+\.(png|jpg)/i)
      if (match) {
        const expectedFile = match[0]
        if (imageFiles.includes(expectedFile)) {
          return `/images/${expectedFile}`
        }
      }
    }
    
    // Fallback to a random image from available images
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)]
    return randomImage ? `/images/${randomImage}` : '/images/placeholder.svg'
  }
  
  transformCategories(crawledCategories) {
    console.log('🔄 Transforming categories...')
    
    return crawledCategories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || `${category.name} from JP Caster`,
      created_at: new Date().toISOString()
    }))
  }
  
  transformProducts(crawledProducts, categories) {
    console.log('🔄 Transforming products...')
    
    // Create category lookup
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))
    
    return crawledProducts.map((product, index) => {
      const category = categoryMap.get(product.categoryId) || categoryMap.get('cat_1')
      
      const transformedProduct = {
        id: product.id,
        name: product.name || `Product ${index + 1}`,
        slug: this.createSlug((product.name || `product-${index + 1}`) + `-${index}`),
        description: this.generateDescription(product),
        price: parseFloat(product.price) || 0,
        sku: product.sku,
        stock_quantity: parseInt(product.stock) || 100,
        manufacturer: 'JP Caster',
        is_published: product.status === 'active',
        category_id: product.categoryId,
        main_image_url: this.getLocalImagePath(product),
        image_urls: [this.getLocalImagePath(product)],
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      return transformedProduct
    })
  }
  
  async run() {
    try {
      console.log('🚀 Starting crawled data transformation...')
      
      // Load crawled data
      const crawledCategoriesPath = path.join(this.crawledDir, 'categories.json')
      const crawledProductsPath = path.join(this.crawledDir, 'products.json')
      
      if (!fs.existsSync(crawledCategoriesPath) || !fs.existsSync(crawledProductsPath)) {
        throw new Error('Crawled data files not found')
      }
      
      const crawledCategories = JSON.parse(fs.readFileSync(crawledCategoriesPath, 'utf8'))
      const crawledProducts = JSON.parse(fs.readFileSync(crawledProductsPath, 'utf8'))
      
      console.log(`📂 Loaded ${crawledCategories.length} categories and ${crawledProducts.length} products`)
      
      // Transform data
      const transformedCategories = this.transformCategories(crawledCategories)
      const transformedProducts = this.transformProducts(crawledProducts, transformedCategories)
      
      // Ensure target directory exists
      if (!fs.existsSync(this.targetDir)) {
        fs.mkdirSync(this.targetDir, { recursive: true })
      }
      
      // Backup existing files
      const backupDir = path.join(this.targetDir, 'backup')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      
      const existingCategoriesPath = path.join(this.targetDir, 'categories.json')
      const existingProductsPath = path.join(this.targetDir, 'products.json')
      
      if (fs.existsSync(existingCategoriesPath)) {
        fs.copyFileSync(existingCategoriesPath, path.join(backupDir, `categories-${timestamp}.json`))
      }
      
      if (fs.existsSync(existingProductsPath)) {
        fs.copyFileSync(existingProductsPath, path.join(backupDir, `products-${timestamp}.json`))
      }
      
      // Write transformed data
      fs.writeFileSync(
        existingCategoriesPath,
        JSON.stringify(transformedCategories, null, 2)
      )
      
      fs.writeFileSync(
        existingProductsPath,
        JSON.stringify(transformedProducts, null, 2)
      )
      
      console.log('✅ Data transformation completed!')
      console.log(`📂 Categories: ${transformedCategories.length}`)
      console.log(`📦 Products: ${transformedProducts.length}`)
      console.log(`💾 Files saved to: ${this.targetDir}`)
      console.log(`📋 Backups saved to: ${backupDir}`)
      
      // Show some sample products
      console.log('\n📋 Sample transformed products:')
      transformedProducts.slice(0, 3).forEach(product => {
        console.log(`  - ${product.name} (${product.slug})`)
        console.log(`    Image: ${product.main_image_url}`)
        console.log(`    Category: ${product.category_id}`)
      })
      
    } catch (error) {
      console.error('❌ Transformation failed:', error)
      throw error
    }
  }
}

// Run transformation
const transformer = new CrawledDataTransformer()
transformer.run()