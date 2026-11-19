// One-off script: generate favicon/icon PNGs (and a PNG-in-ICO favicon.ico)
// from public/logo.svg. Run with: node scripts/generate-favicons.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SVG_PATH = path.join(PUBLIC_DIR, 'logo.svg');

async function renderPng(size) {
  return sharp(SVG_PATH, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png()
    .toBuffer();
}

// Minimal single-image ICO container wrapping a PNG buffer (supported since Vista).
function buildIco(pngBuffer, size) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count

  const dirEntry = Buffer.alloc(dirEntrySize);
  dirEntry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  dirEntry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  dirEntry.writeUInt8(0, 2); // color palette
  dirEntry.writeUInt8(0, 3); // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bits per pixel
  dirEntry.writeUInt32LE(pngBuffer.length, 8); // image size
  dirEntry.writeUInt32LE(headerSize + dirEntrySize, 12); // offset

  return Buffer.concat([header, dirEntry, pngBuffer]);
}

async function main() {
  const png16 = await renderPng(16);
  const png32 = await renderPng(32);
  const png180 = await renderPng(180);
  const png512 = await renderPng(512);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), png512);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), buildIco(png32, 32));

  console.log('Favicons written to', PUBLIC_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
