import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { APP_VERSION, checkForUpdates } from './config/version'

// Log app version
console.log('🚀 Pizzeria Regina 2000 - Version:', APP_VERSION);

// Check for updates and clear cache if needed
checkForUpdates();

createRoot(document.getElementById("root")!).render(<App />);
