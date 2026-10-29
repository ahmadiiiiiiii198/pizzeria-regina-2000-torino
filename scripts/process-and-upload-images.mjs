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
const batchFiles = ['batch1_images.json', 'batch2_images.json', 'batch3_images.json', 'workmode_images.json'];

async function main() {
  console.log('🚀 Starting processing and upload of generated pizza images...');

  const allImages = [];

  for (const bFile of batchFiles) {
    const fullPath = path.join(sourceDir, bFile);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      continue;
    }
    console.log(`📖 Reading ${bFile}...`);
    try {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (content && Array.isArray(content.items)) {
        for (const item of content.items) {
          if (item && item.base64 && item.name) {
            allImages.push(item);
          }
        }
      }
    } catch (e) {
      console.error(`Error parsing ${bFile}:`, e.message);
    }
  }

  console.log(`✨ Found ${allImages.length} generated images ready for upload.`);

  const uploadedProducts = [];

  for (const imgData of allImages) {
    const { name, slug, base64 } = imgData;
    console.log(`\n🍕 Processing: ${name} (${slug})`);

    try {
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      // 1. Save local file
      const localFilePath = path.join(productsImgDir, `${slug}.png`);
      fs.writeFileSync(localFilePath, buffer);
      console.log(`  💾 Saved locally: public/images/products/${slug}.png (${(buffer.length / 1024).toFixed(1)} KB)`);

      // 2. Upload to Supabase Storage
      const storagePath = `pizzas/${slug}.png`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(storagePath, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      let finalUrl = `/images/products/${slug}.png`;

      if (uploadError) {
        console.warn(`  ⚠️ Storage upload warning: ${uploadError.message}`);
      } else {
        const { data: publicData } = supabase.storage
          .from('uploads')
          .getPublicUrl(storagePath);
        if (publicData?.publicUrl) {
          finalUrl = publicData.publicUrl;
          console.log(`  ☁️ Storage public URL: ${finalUrl}`);
        }
      }

      // 3. Update database
      const { data: updated, error: updateError } = await supabase
        .from('products')
        .update({ image_url: finalUrl })
        .ilike('name', `%${name}%`)
        .select('id, name, image_url');

      if (updateError) {
        console.error(`  ❌ Database update error:`, updateError.message);
      } else {
        console.log(`  ✅ Database updated for: ${name} (${updated?.length || 0} row(s))`);
        uploadedProducts.push({ name, url: finalUrl });
      }
    } catch (err) {
      console.error(`  ❌ Error processing ${name}:`, err.message);
    }
  }

  // 4. Update any remaining products with matching realistic styles
  console.log('\n🔍 Checking all products in database...');
  const { data: allDbProducts, error: dbErr } = await supabase
    .from('products')
    .select('id, name, image_url');

  if (!dbErr && allDbProducts) {
    const defaultPlaceholder = 'images.unsplash.com';
    const fallbackImage = uploadedProducts[0]?.url || '/images/products/margherita.png';

    for (const p of allDbProducts) {
      if (!p.image_url || p.image_url.includes(defaultPlaceholder)) {
        // Find best match among uploaded products or use high quality style
        let matchUrl = fallbackImage;
        if (p.name.toLowerCase().includes('formaggi') || p.name.toLowerCase().includes('cheese')) {
          matchUrl = uploadedProducts.find(u => u.name === 'Formaggi')?.url || fallbackImage;
        } else if (p.name.toLowerCase().includes('focaccia')) {
          matchUrl = uploadedProducts.find(u => u.name.includes('Focaccia'))?.url || fallbackImage;
        } else if (p.name.toLowerCase().includes('funghi') || p.name.toLowerCase().includes('porcini')) {
          matchUrl = uploadedProducts.find(u => u.name === 'Funghi')?.url || fallbackImage;
        } else if (p.name.toLowerCase().includes('diavola') || p.name.toLowerCase().includes('salsiccia')) {
          matchUrl = uploadedProducts.find(u => u.name === 'Diavola')?.url || fallbackImage;
        }

        await supabase
          .from('products')
          .update({ image_url: matchUrl })
          .eq('id', p.id);
        console.log(`  🔄 Assigned realistic image to: ${p.name}`);
      }
    }
  }

  console.log('\n🎉 ALL PRODUCTS SUCCESSFULLY UPDATED WITH REALISTIC PICS!');
}

main().catch(console.error);
