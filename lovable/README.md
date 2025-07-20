# JP Caster E-commerce Platform

## Project Overview

A modern e-commerce platform for JP Caster industrial casters and wheels, built with React, TypeScript, and Supabase. Features comprehensive product catalog, web scraping capabilities, and automated data import functionality.

## Project info

**URL**: https://lovable.dev/projects/4e846b4e-51aa-48fa-b43a-82cc3d2c8b5c

## Features

- 🛒 **E-commerce Platform**: Full-featured online store for industrial casters
- 🕷️ **Web Scraping**: Automated data collection from JP Caster website
- 📊 **Data Management**: Comprehensive product and category management
- 🖼️ **Image Handling**: Automatic image download and local storage
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🔍 **Search & Filter**: Advanced product search and filtering capabilities

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Data Management
```bash
npm run crawl-jpcaster      # Full website crawling
npm run test-simple         # Test single page crawl
npm run import-crawled      # Import crawled data to Supabase
npm run generate-sql        # Generate SQL for manual import
```

### Database
```bash
npm run import-from-json    # Import JSON data directly
npm run direct-import       # Direct database import with hardcoded credentials
```

## Web Scraping System

The project includes a comprehensive web scraping system that collects product data from the JP Caster website:

### Crawled Categories (30 total)
- Industrial Casters, Heavy Duty Casters, Medical Casters
- Light/Medium/Heavy Duty varieties
- Swivel, Fixed, and Brake Casters
- Specialty categories (Furniture, Cart, Trolley, Platform, etc.)
- Material-specific (Rubber, Polyurethane, Nylon, Steel, Plastic)
- Performance categories (Anti-Static, High/Low Temperature)

### Data Collection Features
- **Smart Parsing**: Automatic detection of product information
- **Image Download**: Local storage of product images
- **Category Mapping**: Intelligent categorization system
- **Error Handling**: Robust error handling and retry mechanisms
- **Progress Tracking**: Real-time crawling progress updates

## Data Import Process

### Method 1: Automated Import
```bash
npm run import-crawled
```

### Method 2: Manual SQL Import
1. Run `npm run import-crawled` to generate SQL
2. Go to Supabase Dashboard > SQL Editor
3. Execute the generated `crawled_import.sql` file

### Method 3: Direct Database Connection
```bash
npm run direct-import
```

## Database Schema

### Categories Table
- `id`: Primary key
- `name`: Category name
- `slug`: URL-friendly identifier
- `description`: Category description
- `is_active`: Status flag

### Products Table
- `id`: Primary key
- `name`: Product name
- `slug`: URL-friendly identifier
- `sku`: Product SKU
- `price`: Product price
- `category_id`: Foreign key to categories
- `main_image_url`: Primary product image
- `image_urls`: Additional images array
- `stock_quantity`: Available stock
- `manufacturer`: Product manufacturer
- `tags`: Product tags array

## Project Structure

```
lovable/
├── scripts/                    # Automation scripts
│   ├── simple-crawler.mjs     # Main crawling script
│   ├── import-crawled-data.mjs # Data import script
│   └── ...                    # Other utility scripts
├── crawled_data/              # Scraped data storage
│   ├── products.json          # Product data
│   ├── categories.json        # Category data
│   └── crawl_results.json     # Detailed crawl results
├── public/images/crawled/     # Downloaded product images
├── src/
│   ├── components/            # React components
│   ├── data/                  # Static data files
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   └── types/                 # TypeScript definitions
└── supabase/                  # Database configuration
```

## Getting Started with Data

1. **Initial Setup**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create `.env` file with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Crawl Product Data**:
   ```bash
   npm run crawl-jpcaster
   ```

4. **Import to Database**:
   ```bash
   npm run import-crawled
   ```

5. **Start Development**:
   ```bash
   npm run dev
   ```

## Data Statistics

- **Categories**: 30 specialized caster categories
- **Products**: 191+ unique products crawled
- **Images**: Automatic download and storage
- **Coverage**: Complete JP Caster product catalog

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4e846b4e-51aa-48fa-b43a-82cc3d2c8b5c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4e846b4e-51aa-48fa-b43a-82cc3d2c8b5c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
