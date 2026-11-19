// One-off script: generate favicon/icon PNGs (and a PNG-in-ICO favicon.ico)
// from public/logo.svg. Run with: node scripts/generate-favicons.cjs
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SVG_PATH = path.join(PUBLIC_DIR, 'logo.svg');

async function renderPng(size) {
  // High density so the SVG rasterizes at well above target size before
  // sharp's downscale, keeping edges crisp instead of blurry.
  return sharp(SVG_PATH, { density: 1200 })
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .png()
    .toBuffer();
}

// Multi-image ICO container wrapping several PNG buffers (PNG-in-ICO is
// supported since Vista), so the browser/OS picks the sharpest size
// instead of scaling a single bitmap up or down.
function buildIco(entries) {
  const headerSize = 6;
  const dirEntrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4); // count

  let offset = headerSize + dirEntrySize * entries.length;
  const dirEntries = [];
  const imageBuffers = [];

  for (const { size, png } of entries) {
    const dirEntry = Buffer.alloc(dirEntrySize);
    dirEntry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    dirEntry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    dirEntry.writeUInt8(0, 2); // color palette
    dirEntry.writeUInt8(0, 3); // reserved
    dirEntry.writeUInt16LE(1, 4); // color planes
    dirEntry.writeUInt16LE(32, 6); // bits per pixel
    dirEntry.writeUInt32LE(png.length, 8); // image size
    dirEntry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(dirEntry);
    imageBuffers.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function main() {
  const png16 = await renderPng(16);
  const png32 = await renderPng(32);
  const png48 = await renderPng(48);
  const png180 = await renderPng(180);
  const png512 = await renderPng(512);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), png512);
  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'favicon.ico'),
    buildIco([
      { size: 16, png: png16 },
      { size: 32, png: png32 },
      { size: 48, png: png48 },
    ]),
  );

  console.log('Favicons written to', PUBLIC_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
