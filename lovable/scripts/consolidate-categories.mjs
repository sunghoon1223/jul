import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class CategoryConsolidator {
  constructor() {
    this.dataDir = path.join(__dirname, '../src/data')
    this.categoriesPath = path.join(this.dataDir, 'categories.json')
    this.productsPath = path.join(this.dataDir, 'products.json')
    
    // Define the 6 main categories
    this.mainCategories = [
      {
        id: 'cat_1',
        name: 'Industrial Casters',
        slug: 'industrial-casters',
        description: 'Heavy-duty and industrial-grade casters for professional applications'
      },
      {
        id: 'cat_2', 
        name: 'Medical & Healthcare',
        slug: 'medical-healthcare',
        description: 'Specialized casters for medical equipment and healthcare applications'
      },
      {
        id: 'cat_3',
        name: 'Office & Furniture',
        slug: 'office-furniture', 
        description: 'Casters for office furniture, chairs, and light-duty applications'
      },
      {
        id: 'cat_4',
        name: 'Material Handling',
        slug: 'material-handling',
        description: 'Casters for carts, trolleys, and material transport equipment'
      },
      {
        id: 'cat_5',
        name: 'Specialty & Custom',
        slug: 'specialty-custom',
        description: 'Custom and specialty casters for unique applications'
      },
      {
        id: 'cat_6',
        name: 'High Performance',
        slug: 'high-performance',
        description: 'High-performance casters with advanced materials and features'
      }
    ]
    
    // Map old categories to new categories
    this.categoryMapping = {
      'cat_1': 'cat_1',  // Industrial Casters
      'cat_2': 'cat_1',  // Heavy Duty Casters -> Industrial
      'cat_3': 'cat_2',  // Medical Casters
      'cat_4': 'cat_3',  // Light Duty Casters -> Office & Furniture
      'cat_5': 'cat_1',  // Medium Duty Casters -> Industrial
      'cat_6': 'cat_1',  // Heavy Duty Industrial -> Industrial
      'cat_7': 'cat_1',  // Swivel Casters -> Industrial
      'cat_8': 'cat_1',  // Fixed Casters -> Industrial
      'cat_9': 'cat_1',  // Brake Casters -> Industrial
      'cat_10': 'cat_5', // Specialty Casters
      'cat_11': 'cat_5', // Custom Casters
      'cat_12': 'cat_3', // Furniture Casters -> Office & Furniture
      'cat_13': 'cat_4', // Cart Casters -> Material Handling
      'cat_14': 'cat_4', // Trolley Casters -> Material Handling
      'cat_15': 'cat_4', // Platform Casters -> Material Handling
      'cat_16': 'cat_3', // Door Casters -> Office & Furniture
      'cat_17': 'cat_1', // Equipment Casters -> Industrial
      'cat_18': 'cat_1', // Machine Casters -> Industrial
      'cat_19': 'cat_6', // Pneumatic Casters -> High Performance
      'cat_20': 'cat_6', // Rubber Wheel Casters -> High Performance
      'cat_21': 'cat_6', // Polyurethane Casters -> High Performance
      'cat_22': 'cat_6', // Nylon Wheel Casters -> High Performance
      'cat_23': 'cat_6', // Steel Wheel Casters -> High Performance
      'cat_24': 'cat_3', // Plastic Wheel Casters -> Office & Furniture
      'cat_25': 'cat_6', // Ball Bearing Casters -> High Performance
      'cat_26': 'cat_6', // Roller Bearing Casters -> High Performance
      'cat_27': 'cat_2', // Stainless Steel Casters -> Medical & Healthcare
      'cat_28': 'cat_5', // Anti-Static Casters -> Specialty & Custom
      'cat_29': 'cat_5', // High Temperature Casters -> Specialty & Custom
      'cat_30': 'cat_5'  // Low Temperature Casters -> Specialty & Custom
    }
  }
  
  async run() {
    try {
      console.log('🚀 Starting category consolidation...')
      
      // Load existing data
      const categories = JSON.parse(fs.readFileSync(this.categoriesPath, 'utf8'))
      const products = JSON.parse(fs.readFileSync(this.productsPath, 'utf8'))
      
      console.log(`📂 Loaded ${categories.length} categories and ${products.length} products`)
      
      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(this.dataDir, 'backup')
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      
      fs.writeFileSync(
        path.join(backupDir, `categories-before-consolidation-${timestamp}.json`),
        JSON.stringify(categories, null, 2)
      )
      
      fs.writeFileSync(
        path.join(backupDir, `products-before-consolidation-${timestamp}.json`),
        JSON.stringify(products, null, 2)
      )
      
      console.log(`💾 Backups saved to: ${backupDir}`)
      
      // Update products with new category mappings
      console.log('🔄 Updating product categories...')
      const updatedProducts = products.map(product => {
        const oldCategoryId = product.category_id
        const newCategoryId = this.categoryMapping[oldCategoryId] || 'cat_1'
        
        if (oldCategoryId !== newCategoryId) {
          console.log(`  Product ${product.name}: ${oldCategoryId} → ${newCategoryId}`)
        }
        
        return {
          ...product,
          category_id: newCategoryId
        }
      })
      
      // Add timestamp to main categories
      const consolidatedCategories = this.mainCategories.map(category => ({
        ...category,
        created_at: new Date().toISOString()
      }))
      
      // Save consolidated data
      fs.writeFileSync(this.categoriesPath, JSON.stringify(consolidatedCategories, null, 2))
      fs.writeFileSync(this.productsPath, JSON.stringify(updatedProducts, null, 2))
      
      console.log('✅ Category consolidation completed!')
      console.log(`📂 Categories: ${categories.length} → ${consolidatedCategories.length}`)
      console.log(`📦 Products updated: ${updatedProducts.length}`)
      
      // Show category distribution
      console.log('\n📊 Product distribution by category:')
      const distribution = {}
      updatedProducts.forEach(product => {
        distribution[product.category_id] = (distribution[product.category_id] || 0) + 1
      })
      
      consolidatedCategories.forEach(category => {
        const count = distribution[category.id] || 0
        console.log(`  ${category.name}: ${count} products`)
      })
      
    } catch (error) {
      console.error('❌ Category consolidation failed:', error)
      throw error
    }
  }
}

// Run consolidation
const consolidator = new CategoryConsolidator()
consolidator.run()