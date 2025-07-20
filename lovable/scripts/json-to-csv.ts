import * as fs from 'fs'
import * as path from 'path'

interface Product {
  product_id: string
  sku: string
  product_name: string
  short_description: string
  long_description: string
  regular_price: string
  sale_price: string
  tags: string
  stock_status: string
  weight: string
  dimensions: string
  product_url: string
  main_image_url: string
  image_urls: string[]
  category: {
    id: string
    name: string
    slug: string
    description: string
    created_at: string
  }
  features: any
}

function escapeCsvValue(value: string): string {
  // If value contains comma, newline, or quotes, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function extractImageFilename(url: string): string {
  // Extract just the filename from the URL
  const parts = url.split('/')
  return parts[parts.length - 1] || ''
}

async function convertJsonToCsv() {
  try {
    console.log('Converting products.json to CSV format...')
    
    // Read products.json
    const productsPath = path.join(__dirname, '../src/data/products.json')
    const productsData: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    console.log(`Found ${productsData.length} products to convert`)
    
    // CSV header matching the Supabase function expectations
    const headers = [
      'name',
      'description',
      'price',
      'category_name',
      'stock_quantity',
      'sku',
      'manufacturer',
      'main_image_filename',
      'additional_image_filenames'
    ]
    
    // Create CSV rows
    const csvRows: string[] = [headers.join(',')]
    
    for (const product of productsData) {
      const row = [
        escapeCsvValue(product.product_name),
        escapeCsvValue(product.long_description || product.short_description || ''),
        escapeCsvValue(product.regular_price || '0'),
        escapeCsvValue(product.category?.name || 'Uncategorized'),
        escapeCsvValue(product.stock_status === 'instock' ? '100' : '0'),
        escapeCsvValue(product.sku),
        escapeCsvValue(''), // manufacturer - not in current data
        escapeCsvValue(extractImageFilename(product.main_image_url)),
        escapeCsvValue(product.image_urls?.slice(1).map(extractImageFilename).join(';') || '')
      ]
      
      csvRows.push(row.join(','))
    }
    
    // Write CSV file
    const csvContent = csvRows.join('\n')
    const outputPath = path.join(__dirname, '../products_data.csv')
    fs.writeFileSync(outputPath, csvContent, 'utf8')
    
    console.log(`✓ CSV file created: ${outputPath}`)
    console.log(`Total rows: ${csvRows.length - 1} (excluding header)`)
    console.log('\nTo use this CSV:')
    console.log('1. Upload it to Supabase Storage in the "data" bucket as "products_data.csv"')
    console.log('2. Make sure you also upload the product images to the "imager" bucket')
    console.log('3. Run the import-initial-jpcaster-data Edge Function')
    
  } catch (error) {
    console.error('Error converting to CSV:', error)
    process.exit(1)
  }
}

// Run the conversion
convertJsonToCsv()