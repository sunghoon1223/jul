import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class ProductSlugFixer {
  constructor() {
    this.dataDir = path.join(__dirname, '../src/data')
    this.productsPath = path.join(this.dataDir, 'products.json')
  }
  
  createSlug(text, index) {
    // Clean up the text first
    let cleanText = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
    
    // Handle Chinese characters and empty strings
    if (!cleanText || cleanText.length < 2) {
      cleanText = `product-${index + 1}`
    }
    
    // Limit length and add index for uniqueness
    cleanText = cleanText.slice(0, 50)
    
    return `${cleanText}-${index}`
  }
  
  async run() {
    try {
      console.log('🚀 Starting product slug fix...')
      
      if (!fs.existsSync(this.productsPath)) {
        throw new Error('Products file not found')
      }
      
      const products = JSON.parse(fs.readFileSync(this.productsPath, 'utf8'))
      console.log(`📂 Loaded ${products.length} products`)
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(this.dataDir, `products-backup-${timestamp}.json`)
      fs.writeFileSync(backupPath, JSON.stringify(products, null, 2))
      console.log(`💾 Backup saved: ${backupPath}`)
      
      // Fix slugs
      const fixedProducts = products.map((product, index) => {
        const originalSlug = product.slug
        const newSlug = this.createSlug(product.name, index)
        
        if (originalSlug !== newSlug) {
          console.log(`  ${product.name}: "${originalSlug}" → "${newSlug}"`)
        }
        
        return {
          ...product,
          slug: newSlug
        }
      })
      
      // Check for duplicate slugs
      const slugCounts = {}
      fixedProducts.forEach(product => {
        slugCounts[product.slug] = (slugCounts[product.slug] || 0) + 1
      })
      
      const duplicates = Object.entries(slugCounts).filter(([slug, count]) => count > 1)
      if (duplicates.length > 0) {
        console.log('⚠️  Found duplicate slugs:', duplicates)
        
        // Fix duplicates by adding additional index
        const slugUsage = {}
        fixedProducts.forEach(product => {
          const baseSlug = product.slug
          if (slugCounts[baseSlug] > 1) {
            const usage = (slugUsage[baseSlug] || 0) + 1
            slugUsage[baseSlug] = usage
            if (usage > 1) {
              product.slug = `${baseSlug}-${usage}`
            }
          }
        })
      }
      
      // Save fixed products
      fs.writeFileSync(this.productsPath, JSON.stringify(fixedProducts, null, 2))
      
      console.log('✅ Product slug fix completed!')
      console.log(`📦 Fixed ${fixedProducts.length} products`)
      
      // Show some sample slugs
      console.log('\\n📋 Sample fixed slugs:')
      fixedProducts.slice(0, 5).forEach(product => {
        console.log(`  ${product.name} → ${product.slug}`)
      })
      
    } catch (error) {
      console.error('❌ Slug fix failed:', error)
      throw error
    }
  }
}

// Run slug fix
const fixer = new ProductSlugFixer()
fixer.run()