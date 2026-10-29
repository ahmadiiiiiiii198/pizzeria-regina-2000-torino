import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const productsImgDir = path.join(projectRoot, 'public', 'images', 'products');

if (!fs.existsSync(productsImgDir)) {
  fs.mkdirSync(productsImgDir, { recursive: true });
}

const SUPABASE_URL = 'https://jncuwwavffepnajxvjxq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3V3d2F2ZmZlcG5hanh2anhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgzMzEyNSwiZXhwIjoyMDc1NDA5MTI1fQ.byUGwCNwqa5KPL0MjbXGhRtLSwNNlFHCFq9CRo4S92Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'regina' }
});

const sourceDir = 'C:\\Users\\emper\\AppData\\Local\\Programs\\antigravity';

// Mapping definitions between exact database product names and their generated images
const titleToProductMap = [
  // From workmode_images.json
  { matchName: 'Margherita', slug: 'margherita', sourceFile: 'workmode_images.json', sourceItemName: 'Margherita' },
  { matchName: 'Marinara', slug: 'marinara', sourceFile: 'workmode_images.json', sourceItemName: 'Marinara' },
  { matchName: 'Diavola', slug: 'diavola', sourceFile: 'workmode_images.json', sourceItemName: 'Diavola' },
  { matchName: 'Funghi', slug: 'funghi', sourceFile: 'workmode_images.json', sourceItemName: 'Funghi' },
  { matchName: 'Prosciutto', slug: 'prosciutto', sourceFile: 'workmode_images.json', sourceItemName: 'Prosciutto' },

  // From all_workmode_outputs.json
  { matchName: 'Biancaneve', slug: 'biancaneve', outputMatch: 'Biancaneve' },
  { matchName: 'Formaggi', slug: 'formaggi', outputMatch: 'four-cheese' },
  { matchName: 'Capricciosa', slug: 'capricciosa', outputMatch: 'Capricciosa' },
  { matchName: '4 Stagioni', slug: 'quattro-stagioni', outputMatch: 'Four Seasons' },
  { matchName: 'Napoli', slug: 'napoli', outputMatch: 'Napoli' },
  { matchName: 'Greca', slug: 'greca', outputMatch: 'Greca' },
  { matchName: 'Calzone', slug: 'calzone', outputMatch: 'Golden folded calzone' },
  { matchName: 'Romana', slug: 'romana', outputMatch: 'Roman Pizza' },
  { matchName: 'Pizza Regina', slug: 'pizza-regina', outputMatch: 'Porcini and Ventricina Regina' },
  { matchName: 'Pugliese', slug: 'pugliese', outputMatch: 'Pugliese' },
  { matchName: 'Vegetariana', slug: 'vegetariana', outputMatch: 'Vegetariana' },
  { matchName: 'Salsiccia e Melanzane', slug: 'salsiccia-e-melanzane', outputMatch: 'Salsiccia e Melanzane' },
  { matchName: 'Norma', slug: 'norma', outputMatch: 'Norma' },
  { matchName: 'Chef', slug: 'chef', outputMatch: 'Round prosciutto, mushroom and cream' },
  { matchName: 'Focaccia al Crudo', slug: 'focaccia-al-crudo', outputMatch: 'Crisp round focaccia with prosciutto' },
  { matchName: 'Torinese', slug: 'torinese', outputMatch: 'Torinese' },
  { matchName: 'Partenopea', slug: 'partenopea', outputMatch: 'Partenopea' },
  { matchName: 'Prosciutto e Funghi', slug: 'prosciutto-e-funghi', outputMatch: 'Prosciutto e Funghi' },
  { matchName: 'Boscaiola', slug: 'boscaiola', outputMatch: 'Boscaiola' },
  { matchName: 'Focaccia allo Speck', slug: 'focaccia-allo-speck', outputMatch: 'Crispy speck-topped round focaccia' },
  { matchName: 'Parmigiana', slug: 'parmigiana', outputMatch: 'Parmigiana' },
  { matchName: 'Focaccia Primavera', slug: 'focaccia-primavera', outputMatch: 'Focaccia Primavera' },
  { matchName: 'Chèvre', slug: 'chevre', outputMatch: 'Goat Cheese' },
  { matchName: 'Petite', slug: 'petite', outputMatch: 'Petite Torino' },
  { matchName: 'Peperlizia', slug: 'peperlizia', outputMatch: 'Peperlizia' },
  { matchName: 'Carciofi', slug: 'carciofi', outputMatch: 'Carciofi' },
  { matchName: 'Gustosa', slug: 'gustosa', outputMatch: 'Gustosa' },
  { matchName: 'Imperiale', slug: 'imperiale', outputMatch: 'Imperiale' },
  { matchName: 'Meraviglia', slug: 'meraviglia', outputMatch: 'Meraviglia' },
  { matchName: 'Messicana', slug: 'messicana', outputMatch: 'Messicana' },
  { matchName: 'Piemontese', slug: 'piemontese', outputMatch: 'Piemontese' },
  { matchName: 'Trevigiana', slug: 'trevigiana', outputMatch: 'Trevigiana' },
  { matchName: 'Praga', slug: 'praga', outputMatch: 'Praga' },
  { matchName: 'Pizza al Metro (fino a 5 gusti)', slug: 'pizza-al-metro', outputMatch: 'Pizza al Metro' },
  { matchName: 'Fagotto al Crudo', slug: 'fagotto-al-crudo', outputMatch: 'Fagotto with Prosciutto' },
  { matchName: 'Fagotto allo Speck', slug: 'fagotto-allo-speck', outputMatch: 'Speck, Brie, and Eggplant Fagotto' },
  { matchName: 'Filadelfia', slug: 'filadelfia', outputMatch: 'Filadelfia' },
  { matchName: 'Schiacciata Campagnola', slug: 'schiacciata-campagnola', outputMatch: 'Schiacciata Campagnola' },
  { matchName: 'Schiacciata Sacense', slug: 'schiacciata-sacense', outputMatch: 'Sciacca-Style' },
  { matchName: 'Schiacciata Catanese', slug: 'schiacciata-catanese', outputMatch: 'Catanese' },
  { matchName: 'Degustazione Regina 2000', slug: 'degustazione-regina-2000', outputMatch: 'tasting board' },
  { matchName: 'Student Special', slug: 'student-special', outputMatch: 'Student Special' },
  { matchName: 'Affettati', slug: 'extra-affettati', outputMatch: 'Cold Cuts Board' },
  { matchName: 'Bresaola', slug: 'extra-bresaola', outputMatch: 'Bresaola with lemon' },
  { matchName: 'Bufala', slug: 'extra-bufala', outputMatch: 'buffalo mozzarella' },
  { matchName: 'Burrata', slug: 'extra-burrata', outputMatch: 'Burrata' },
  { matchName: 'Crudo', slug: 'extra-crudo', outputMatch: 'Prosciutto di Parma Platter' },
  { matchName: 'Porcini', slug: 'extra-porcini', outputMatch: 'Porcini with Garlic' },
];

async function main() {
  console.log('🚀 Loading image datasets...');

  // 1. Read datasets
  const workmodeImages = JSON.parse(fs.readFileSync(path.join(sourceDir, 'workmode_images.json'), 'utf8'));
  const allOutputs = JSON.parse(fs.readFileSync(path.join(sourceDir, 'all_workmode_outputs.json'), 'utf8'));

  console.log(`Loaded ${workmodeImages.items?.length || 0} items from workmode_images.json`);
  console.log(`Loaded ${allOutputs.items?.length || 0} items from all_workmode_outputs.json`);

  // 2. Fetch all products from database
  const { data: dbProducts, error: dbErr } = await supabase.from('products').select('id, name').order('name');
  if (dbErr) {
    throw new Error(`Failed to fetch database products: ${dbErr.message}`);
  }
  console.log(`Found ${dbProducts.length} products in database table regina.products\n`);

  let successCount = 0;

  for (const product of dbProducts) {
    const config = titleToProductMap.find(m => m.matchName.toLowerCase() === product.name.toLowerCase());

    if (!config) {
      console.warn(`⚠️ No mapping config found for database product: "${product.name}"`);
      continue;
    }

    let base64 = null;

    if (config.sourceFile === 'workmode_images.json') {
      const found = workmodeImages.items.find(i => i.name.toLowerCase() === config.sourceItemName.toLowerCase());
      if (found && found.base64) {
        base64 = found.base64;
      }
    } else {
      const found = allOutputs.items.find(i => i.title && i.title.toLowerCase().includes(config.outputMatch.toLowerCase()) && i.base64);
      if (found) {
        base64 = found.base64;
      }
    }

    if (!base64) {
      console.error(`❌ Could not find base64 image for: "${product.name}" (Slug: ${config.slug})`);
      continue;
    }

    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // 1. Save local high-res file
    const localFilePath = path.join(productsImgDir, `${config.slug}.png`);
    fs.writeFileSync(localFilePath, buffer);

    // 2. Upload to Supabase Storage
    const storagePath = `pizzas/${config.slug}.png`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error(`  ⚠️ Supabase storage upload failed for ${config.slug}: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    const publicUrl = publicData?.publicUrl || `/images/products/${config.slug}.png`;

    // 3. Update database record
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('id', product.id);

    if (updateError) {
      console.error(`  ❌ Database update error for ${product.name}: ${updateError.message}`);
    } else {
      console.log(`✅ [${product.name}] => ${config.slug}.png (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
      successCount++;
    }
  }

  console.log(`\n🎉 Successfully processed and updated ${successCount} of ${dbProducts.length} products!`);
}

main().catch(console.error);
