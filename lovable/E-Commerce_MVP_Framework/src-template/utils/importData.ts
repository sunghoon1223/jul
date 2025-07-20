import { supabase } from '@/integrations/supabase/client'

export async function importInitialData() {
  try {
    console.log('Starting data import from Supabase Edge Function...')
    console.log('Supabase URL:', supabase.supabaseUrl)
    
    // Check if Supabase is properly configured
    if (!supabase.supabaseUrl || !supabase.supabaseKey) {
      throw new Error('Supabase is not properly configured. Check your environment variables.')
    }
    
    const { data, error } = await supabase.functions.invoke('import-initial-jpcaster-data')
    
    if (error) {
      console.error('Import error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details
      })
      throw error
    }
    
    console.log('Import completed successfully:', data)
    return data
  } catch (error) {
    console.error('Failed to import data:', error)
    
    // Provide helpful error messages
    if (error.message?.includes('FunctionsNotFound')) {
      console.error('Edge Function not found. Make sure the function is deployed to Supabase.')
    } else if (error.message?.includes('NetworkError')) {
      console.error('Network error. Check your internet connection and Supabase URL.')
    }
    
    throw error
  }
}

// Auto-run import if no data exists
export async function autoImportIfNeeded() {
  try {
    console.log('Checking if data import is needed...')
    
    // First check if we can connect to Supabase
    const { error: pingError } = await supabase.from('products').select('id').limit(1)
    
    if (pingError) {
      console.error('Cannot connect to Supabase:', pingError)
      console.log('Make sure your Supabase project is running and credentials are correct.')
      return
    }
    
    // Check if data already exists
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error checking product count:', countError)
      return
    }
    
    console.log(`Found ${count || 0} products in database`)
    
    if (count === 0) {
      console.log('No data found, starting auto-import...')
      await importInitialData()
    } else {
      console.log('Data already exists, skipping import')
    }
  } catch (error) {
    console.error('Auto-import check failed:', error)
    console.log('You can manually import data using: npm run import-from-json')
  }
}