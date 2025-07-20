import { autoImportIfNeeded } from '../src/utils/importData';

// Add error handling
autoImportIfNeeded()
  .then(() => {
    console.log('Import check completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('Import failed:', error)
    process.exit(1)
  });
