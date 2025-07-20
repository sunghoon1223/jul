# Data Import Guide for Lovable Project

This guide explains the different methods available for importing product data into the Supabase database.

## Prerequisites

1. **Environment Variables**: Make sure you have the following environment variables set:
   - `VITE_SUPABASE_URL` or `SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only needed for Edge Function method)

2. **Database Tables**: Ensure your Supabase database has the following tables:
   - `categories` - Product categories
   - `products` - Product catalog

## Import Methods

### Method 1: Direct JSON Import (Recommended for Development)

This method imports data directly from the local `products.json` and `categories.json` files.

```bash
npm run import-from-json
```

**Features:**
- Imports from local JSON files
- No CSV conversion needed
- Shows progress and error details
- Works with anonymous Supabase key

### Method 2: Supabase Edge Function Import

This method uses a Supabase Edge Function to import from a CSV file stored in Supabase Storage.

```bash
npm run import-data
```

**Requirements:**
1. Upload `products_data.csv` to Supabase Storage bucket named "data"
2. Upload product images to Supabase Storage bucket named "imager"
3. Deploy the Edge Function `import-initial-jpcaster-data`

### Method 3: Convert JSON to CSV

If you need to create a CSV file for the Edge Function method:

```bash
npm run json-to-csv
```

This creates `products_data.csv` in the project root, which you can then upload to Supabase Storage.

## Troubleshooting

### Common Issues

1. **"Supabase is not properly configured"**
   - Check that environment variables are set correctly
   - Verify the Supabase project URL is accessible

2. **"Cannot connect to Supabase"**
   - Ensure your Supabase project is running
   - Check network connectivity
   - Verify the anonymous key has proper permissions

3. **"Edge Function not found"**
   - The Edge Function needs to be deployed to Supabase
   - Check function name matches: `import-initial-jpcaster-data`

4. **Import runs but no data appears**
   - Check browser console for errors
   - Verify table permissions in Supabase
   - Ensure RLS (Row Level Security) policies allow inserts

### Manual Import Steps

If automated import fails, you can manually import data:

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Import CSV directly to tables
4. Or use SQL Editor to insert data

## Data Structure

### Products JSON Structure
```json
{
  "product_id": "JP-354",
  "sku": "JP-354",
  "product_name": "Product Name",
  "short_description": "",
  "long_description": "",
  "regular_price": "99.99",
  "sale_price": "",
  "tags": "tag1,tag2",
  "stock_status": "instock",
  "main_image_url": "/images/image.jpg",
  "image_urls": ["/images/image.jpg"],
  "category": {
    "id": "category-id",
    "name": "Category Name"
  }
}
```

### CSV Structure (for Edge Function)
```
name,description,price,category_name,stock_quantity,sku,manufacturer,main_image_filename,additional_image_filenames
"Product Name","Description","99.99","Category Name","100","JP-354","","image.jpg","image2.jpg;image3.jpg"
```

## Best Practices

1. Always backup your data before running imports
2. Test imports in a development environment first
3. Monitor Supabase logs during import for any errors
4. Use the JSON import method for development to avoid CSV conversion