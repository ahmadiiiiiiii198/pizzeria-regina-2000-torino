// Verify build output
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const assetsPath = path.join(distPath, 'assets');
const indexPath = path.join(distPath, 'index.html');

console.log('\n🔍 ============================================');
console.log('🔍 BUILD VERIFICATION');
console.log('🔍 ============================================\n');

// Check dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder does not exist!');
  process.exit(1);
}

// Check index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist!');
  process.exit(1);
}

console.log('✅ dist folder exists');
console.log('✅ index.html exists');

// List all files in assets
if (fs.existsSync(assetsPath)) {
  const files = fs.readdirSync(assetsPath);
  console.log(`\n📦 Found ${files.length} files in assets:`);
  
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  console.log(`   - ${jsFiles.length} JavaScript files`);
  console.log(`   - ${cssFiles.length} CSS files`);
  
  console.log('\n📄 JavaScript files:');
  jsFiles.forEach(file => console.log(`   ✓ ${file}`));
  
  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS files:');
    cssFiles.forEach(file => console.log(`   ✓ ${file}`));
  }
} else {
  console.error('❌ assets folder does not exist!');
  process.exit(1);
}

// Read and check index.html references
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const jsRefs = [...indexHtml.matchAll(/src="\/assets\/([\w.-]+\.js)"/g)];
const cssRefs = [...indexHtml.matchAll(/href="\/assets\/([\w.-]+\.css)"/g)];

console.log('\n🔗 References in index.html:');
console.log(`   - ${jsRefs.length} JS references`);
console.log(`   - ${cssRefs.length} CSS references`);

// Verify all referenced files exist
let allExist = true;
jsRefs.forEach(match => {
  const filename = match[1];
  const filepath = path.join(assetsPath, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Referenced file missing: ${filename}`);
    allExist = false;
  }
});

cssRefs.forEach(match => {
  const filename = match[1];
  const filepath = path.join(assetsPath, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Referenced file missing: ${filename}`);
    allExist = false;
  }
});

if (allExist) {
  console.log('✅ All referenced files exist!\n');
} else {
  console.error('\n❌ Some referenced files are missing!\n');
  process.exit(1);
}

// Generate 200.html for Cloudflare Pages / SPA fallback
fs.copyFileSync(indexPath, path.join(distPath, '200.html'));
console.log('✅ Generated 200.html for Cloudflare SPA fallback');

console.log('✅ Build verification complete!\n');
