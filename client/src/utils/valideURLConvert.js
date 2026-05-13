// src/utils/valideURLConvert.js
export function valideURLConvert(input = '') {
  return String(input)
    .trim()
    .toLowerCase()
    // Replace any non-word (letters/numbers/underscore) and non-space with a hyphen
    .replace(/[^\w\s-]+/g, '-')
    // Replace whitespace with hyphen
    .replace(/\s+/g, '-')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-|-$/g, '');
}