import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { autoImportIfNeeded } from './utils/importData'

// Auto-import data if needed when app starts
autoImportIfNeeded().catch(console.error)

createRoot(document.getElementById("root")!).render(<App />);