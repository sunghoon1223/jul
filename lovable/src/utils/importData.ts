import { supabase } from '@/integrations/supabase/client'

export async function importInitialData() {
  try {
    console.log('Starting data import...')
    
    const { data, error } = await supabase.functions.invoke('import-initial-jpcaster-data')
    
    if (error) {
      console.error('Import error:', error)
      throw error
    }
    
    console.log('Import completed:', data)
    return data
  } catch (error) {
    console.error('Failed to import data:', error)
    throw error
  }
}

// Auto-run import if no data exists
export async function autoImportIfNeeded() {
  try {
    // Check if data already exists
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (count === 0) {
      console.log('No data found, starting auto-import...')
      await importInitialData()
    }
  } catch (error) {
    console.log('Auto-import check failed:', error)
  }
}