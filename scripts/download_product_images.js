/**
 * Script to download product images
 * Run: node scripts/download_product_images.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const products = [
  { id: 'prod_001', name: 'Sekkisei Clear Wellness Lotion', filename: 'sekkisei-lotion.jpg' },
  { id: 'prod_002', name: 'Sekkisei Clear Wellness Emulsion', filename: 'sekkisei-emulsion.jpg' },
  { id: 'prod_003', name: 'Sekkisei Clear Wellness Wash', filename: 'sekkisei-wash.jpg' },
  { id: 'prod_004', name: 'Decorte AQ Meliority Cream', filename: 'decorte-cream.jpg' },
  { id: 'prod_005', name: 'Decorte AQ Meliority Serum', filename: 'decorte-serum.jpg' },
  { id: 'prod_006', name: 'Infinity Pure Moisture Lotion', filename: 'infinity-lotion.jpg' },
  { id: 'prod_007', name: 'Infinity Pure Moisture Emulsion', filename: 'infinity-emulsion.jpg' },
  { id: 'prod_008', name: 'Esprique Precious Rich Cream', filename: 'esprique-cream.jpg' },
  { id: 'prod_009', name: 'One by Kose Clear Turn Mask', filename: 'onebykose-mask.jpg' },
  { id: 'prod_010', name: 'Sekkisei White Powder Wash', filename: 'sekkisei-powder-wash.jpg' },
];

// Placeholder URLs - Replace these with actual KOSE product image URLs
const imageUrls = {
  'prod_001': 'https://via.placeholder.com/300x300/FF6B9D/FFFFFF?text=Sekkisei+Lotion',
  'prod_002': 'https://via.placeholder.com/300x300/FF6B9D/FFFFFF?text=Sekkisei+Emulsion',
  'prod_003': 'https://via.placeholder.com/300x300/FF6B9D/FFFFFF?text=Sekkisei+Wash',
  'prod_004': 'https://via.placeholder.com/300x300/8B7355/FFFFFF?text=Decorte+Cream',
  'prod_005': 'https://via.placeholder.com/300x300/8B7355/FFFFFF?text=Decorte+Serum',
  'prod_006': 'https://via.placeholder.com/300x300/1F4DA1/FFFFFF?text=Infinity+Lotion',
  'prod_007': 'https://via.placeholder.com/300x300/1F4DA1/FFFFFF?text=Infinity+Emulsion',
  'prod_008': 'https://via.placeholder.com/300x300/E8D5C4/000000?text=Esprique+Cream',
  'prod_009': 'https://via.placeholder.com/300x300/04ACE4/FFFFFF?text=One+by+Kose+Mask',
  'prod_010': 'https://via.placeholder.com/300x300/FF6B9D/FFFFFF?text=Sekkisei+Powder+Wash',
};

const publicDir = path.join(__dirname, '..', 'public', 'products');

// Create products directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('Starting image downloads...\n');
  
  for (const product of products) {
    const url = imageUrls[product.id];
    const filepath = path.join(publicDir, product.filename);
    
    try {
      console.log(`Downloading ${product.name}...`);
      await downloadImage(url, filepath);
      console.log(`✓ Saved: ${product.filename}\n`);
    } catch (error) {
      console.error(`✗ Failed to download ${product.name}:`, error.message);
      console.log(`  URL: ${url}\n`);
    }
  }
  
  console.log('Download complete!');
  console.log('\nNote: These are placeholder images.');
  console.log('To use real KOSE product images:');
  console.log('1. Visit https://www.kose-th.com/');
  console.log('2. Download product images');
  console.log('3. Replace files in public/products/ folder');
  console.log('4. Update imageUrls in this script with actual URLs');
}

downloadAllImages().catch(console.error);

