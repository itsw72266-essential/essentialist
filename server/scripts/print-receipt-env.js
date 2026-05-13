import fs from "fs";

function escapePem(pem) {
  return pem.trim().replace(/\r?\n/g, '\\n');
}

const privatePem = fs.readFileSync('./receipt-keys/receipt-private.pem', 'utf8');
const publicPem  = fs.readFileSync('./receipt-keys/receipt-public.pem', 'utf8');

console.log('\nCopy these into your .env files:\n');
console.log(`RECEIPT_PRIVATE_KEY="${escapePem(privatePem)}"`);
console.log(`NEXT_PUBLIC_RECEIPT_PUBLIC_KEY="${escapePem(publicPem)}"`);
console.log('\n✅ Done.\n');