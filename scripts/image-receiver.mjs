import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(projectRoot, 'public', 'images', 'products');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Supabase configuration with Service Role Key for full write access
const SUPABASE_URL = 'https://jncuwwavffepnajxvjxq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY3V3d2F2ZmZlcG5hanh2anhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgzMzEyNSwiZXhwIjoyMDc1NDA5MTI1fQ.byUGwCNwqa5KPL0MjbXGhRtLSwNNlFHCFq9CRo4S92Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'regina' }
});

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/save-pizza' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { name, slug, base64 } = JSON.parse(body);
        console.log(`📥 Received image for: ${name} (${slug})`);

        // Clean base64 string
        const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');

        // 1. Save locally to public/images/products/<slug>.png
        const filePath = path.join(imagesDir, `${slug}.png`);
        fs.writeFileSync(filePath, buffer);
        console.log(`💾 Saved locally to: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

        // 2. Upload to Supabase Storage bucket 'uploads'
        const storagePath = `pizzas/${slug}.png`;
        const { error: storageError } = await supabase.storage
          .from('uploads')
          .upload(storagePath, buffer, {
            contentType: 'image/png',
            upsert: true
          });

        let publicImageUrl = `/images/products/${slug}.png`;
        if (storageError) {
          console.warn(`⚠️ Supabase storage upload notice: ${storageError.message}`);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(storagePath);
          if (publicUrlData && publicUrlData.publicUrl) {
            publicImageUrl = publicUrlData.publicUrl;
            console.log(`☁️ Supabase public URL: ${publicImageUrl}`);
          }
        }

        // 3. Update regina.products table
        const { data: updateData, error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicImageUrl })
          .ilike('name', `%${name}%`)
          .select('id, name, image_url');

        if (updateError) {
          console.error(`❌ Database update error for ${name}:`, updateError.message);
        } else {
          console.log(`✅ Database updated for ${name}:`, updateData);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          name,
          slug,
          publicImageUrl,
          updatedProducts: updateData
        }));
      } catch (err) {
        console.error('Error processing request:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 3004;
server.listen(PORT, () => {
  console.log(`🚀 Image receiver running at http://localhost:${PORT}`);
});
