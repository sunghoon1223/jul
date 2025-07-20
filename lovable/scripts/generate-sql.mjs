import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function generateInsertSQL() {
  try {
    console.log('Generating SQL insert statements...')
    
    // Read categories.json
    const categoriesPath = path.join(__dirname, '../src/data/categories.json')
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'))
    
    // Read products.json
    const productsPath = path.join(__dirname, '../src/data/products.json')
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    
    let sql = '-- Generated SQL for data import\n\n'
    
    // Generate categories SQL
    sql += '-- Insert categories\n'
    sql += 'INSERT INTO categories (name, slug, description) VALUES\n'
    
    const categoryValues = categoriesData.map((category, index) => {
      const name = category.name.replace(/'/g, "''")
      const slug = category.slug.replace(/'/g, "''")
      const description = (category.description || `Products in the ${category.name} category`).replace(/'/g, "''")
      const comma = index === categoriesData.length - 1 ? ';' : ','
      return `  ('${name}', '${slug}', '${description}')${comma}`
    })
    
    sql += categoryValues.join('\n') + '\n\n'
    
    // Generate products SQL
    sql += '-- Insert products\n'
    sql += 'INSERT INTO products (name, slug, description, price, sale_price, sku, stock_quantity, stock_status, category_id, main_image_url, image_urls, is_published, tags) VALUES\n'
    
    const productValues = productsData.map((product, index) => {
      const name = product.product_name.replace(/'/g, "''")
      const slug = product.sku.toLowerCase().replace(/'/g, "''")
      const description = (product.long_description || product.short_description || '').replace(/'/g, "''")
      const price = parseFloat(product.regular_price) || 0
      const salePrice = product.sale_price ? parseFloat(product.sale_price) : null
      const sku = product.sku.replace(/'/g, "''")
      const stockQuantity = product.stock_status === 'instock' ? 100 : 0
      const stockStatus = product.stock_status || 'instock'
      const mainImageUrl = product.main_image_url ? product.main_image_url.replace(/'/g, "''") : null
      const imageUrls = product.image_urls ? JSON.stringify(product.image_urls) : '[]'
      const tags = product.tags ? `{${product.tags.split(',').map(t => `"${t.trim()}"`).join(',')}}` : '{}'
      
      // Get category by name match
      const categorySlug = product.category?.id || 'unknown'
      
      const comma = index === productsData.length - 1 ? ';' : ','
      
      return `  ('${name}', '${slug}', '${description}', ${price}, ${salePrice}, '${sku}', ${stockQuantity}, '${stockStatus}', (SELECT id FROM categories WHERE slug = '${categorySlug}'), ${mainImageUrl ? `'${mainImageUrl}'` : 'NULL'}, '${imageUrls}', true, '${tags}')${comma}`
    })
    
    sql += productValues.join('\n') + '\n'
    
    // Write SQL file
    const sqlPath = path.join(__dirname, '../import_data.sql')
    fs.writeFileSync(sqlPath, sql)
    
    console.log(`✓ SQL file generated: ${sqlPath}`)
    console.log('To use this file:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy and paste the contents of import_data.sql')
    console.log('3. Run the SQL query')
    console.log(`\nGenerated ${categoriesData.length} category inserts and ${productsData.length} product inserts`)
    
  } catch (error) {
    console.error('Error generating SQL:', error)
    process.exit(1)
  }
}

generateInsertSQL()