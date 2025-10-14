// Generate version file for cache busting
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = `1.0.${Date.now()}`;
const buildTime = new Date().toISOString();

// Write to .env.local for Vite
const envContent = `VITE_APP_VERSION=${version}
VITE_BUILD_TIME=${buildTime}
`;

const envPath = path.join(__dirname, '..', '.env.local');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log('✅ Version generated:', version);
console.log('✅ Build time:', buildTime);
console.log('✅ Written to .env.local');
