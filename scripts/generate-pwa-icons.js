// Script to generate PWA icons from the favicon.svg
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const faviconPath = path.join(__dirname, '..', 'src', 'app', 'favicon.svg');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Define icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Also create Apple touch icon
const appleIconSizes = [180];

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(faviconPath);

    // Generate standard icons
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      
      console.log(`Generated icon-${size}x${size}.png`);
    }

    // Generate Apple touch icons
    for (const size of appleIconSizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `apple-icon-${size}.png`));
      
      console.log(`Generated apple-icon-${size}.png`);
    }

    console.log('All PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating PWA icons:', error);
  }
}

generateIcons();
