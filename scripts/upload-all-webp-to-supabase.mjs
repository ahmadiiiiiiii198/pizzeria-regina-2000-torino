import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const productsImgDir = path.join(projectRoot, 'public', 'images', 'products');

const SUPABASE_URL = 'https://jncuwwavffepnajxvjxq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3V3d2F2ZmZlcG5hanh2anhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgzMzEyNSwiZXhwIjoyMDc1NDA5MTI1fQ.byUGwCNwqa5KPL0MjbXGhRtLSwNNlFHCFq9CRo4S92Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'regina' }
});

async function main() {
  console.log('🚀 Starting upload of optimized WebP images to Supabase Storage CDN...\n');

  // 1. Fetch all products
  const { data: dbProducts, error: dbErr } = await supabase.from('products').select('id, name, image_url').order('name');
  if (dbErr) throw dbErr;

  console.log(`Found ${dbProducts.length} products in database table regina.products`);

  // Map each product name to its slug
  const productSlugMap = {
    '4 Stagioni': 'quattro-stagioni',
    'Affettati': 'extra-affettati',
    'Biancaneve': 'biancaneve',
    'Boscaiola': 'boscaiola',
    'Bresaola': 'extra-bresaola',
    'Bufala': 'extra-bufala',
    'Burrata': 'extra-burrata',
    'Calzone': 'calzone',
    'Capricciosa': 'capricciosa',
    'Carciofi': 'carciofi',
    'Chef': 'chef',
    'Chèvre': 'chevre',
    'Crudo': 'extra-crudo',
    'Degustazione Regina 2000': 'degustazione-regina-2000',
    'Diavola': 'diavola',
    'Fagotto al Crudo': 'fagotto-al-crudo',
    'Fagotto allo Speck': 'fagotto-allo-speck',
    'Filadelfia': 'filadelfia',
    'Focaccia al Crudo': 'focaccia-al-crudo',
    'Focaccia allo Speck': 'focaccia-allo-speck',
    'Focaccia Primavera': 'focaccia-primavera',
    'Formaggi': 'formaggi',
    'Funghi': 'funghi',
    'Greca': 'greca',
    'Gustosa': 'gustosa',
    'Imperiale': 'imperiale',
    'Margherita': 'margherita',
    'Marinara': 'marinara',
    'Meraviglia': 'meraviglia',
    'Messicana': 'messicana',
    'Napoli': 'napoli',
    'Norma': 'norma',
    'Parmigiana': 'parmigiana',
    'Partenopea': 'partenopea',
    'Peperlizia': 'peperlizia',
    'Petite': 'petite',
    'Piemontese': 'piemontese',
    'Pizza al Metro (fino a 5 gusti)': 'pizza-al-metro',
    'Pizza Regina': 'pizza-regina',
    'Porcini': 'extra-porcini',
    'Praga': 'praga',
    'Prosciutto': 'prosciutto',
    'Prosciutto e Funghi': 'prosciutto-e-funghi',
    'Pugliese': 'pugliese',
    'Romana': 'romana',
    'Salsiccia e Melanzane': 'salsiccia-e-melanzane',
    'Schiacciata Campagnola': 'schiacciata-campagnola',
    'Schiacciata Catanese': 'schiacciata-catanese',
    'Schiacciata Sacense': 'schiacciata-sacense',
    'Student Special': 'student-special',
    'Torinese': 'torinese',
    'Trevigiana': 'trevigiana',
    'Vegetariana': 'vegetariana'
  };

  let updatedCount = 0;

  for (const product of dbProducts) {
    const slug = productSlugMap[product.name];
    if (!slug) {
      console.warn(`⚠️ No slug mapping for product: ${product.name}`);
      continue;
    }

    const localWebpPath = path.join(productsImgDir, `${slug}.webp`);
    if (!fs.existsSync(localWebpPath)) {
      console.error(`❌ WebP file not found: ${localWebpPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localWebpPath);
    const storagePath = `pizzas/${slug}.webp`;

    // Upload to Supabase Storage with 1 year cache
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });

    if (uploadError) {
      console.error(`  ⚠️ Upload failed for ${slug}.webp:`, uploadError.message);
      continue;
    }

    const { data: publicData } = supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    const webpUrl = publicData?.publicUrl;

    // Update database
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: webpUrl })
      .eq('id', product.id);

    if (updateError) {
      console.error(`  ❌ Database update error for ${product.name}:`, updateError.message);
    } else {
      console.log(`✅ [${product.name}] => ${slug}.webp (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully uploaded and updated ${updatedCount} of ${dbProducts.length} products to WebP CDN!`);
}

main().catch(console.error);
