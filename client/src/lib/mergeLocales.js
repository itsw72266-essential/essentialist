/** Deep-merge locale objects (nested keys; arrays replaced). */
export function mergeLocales(base, extension) {
  const out = { ...base };
  for (const key of Object.keys(extension)) {
    const val = extension[key];
    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = mergeLocales(base[key], val);
    } else {
      out[key] = val;
    }
  }
  return out;
}
