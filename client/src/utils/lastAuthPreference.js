const STORAGE_KEY = "essentialist_last_auth_provider";

/** @typedef {'email' | 'google'} AuthProvider */

export const AUTH_PROVIDER = {
  EMAIL: "email",
  GOOGLE: "google",
};

function isBrowser() {
  return typeof window !== "undefined";
}

/** @returns {AuthProvider | null} */
export function getLastAuthProvider() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === AUTH_PROVIDER.EMAIL || raw === AUTH_PROVIDER.GOOGLE) return raw;
    return null;
  } catch {
    return null;
  }
}

/** @param {AuthProvider} provider */
export function setLastAuthProvider(provider) {
  if (!isBrowser()) return;
  try {
    if (provider === AUTH_PROVIDER.EMAIL || provider === AUTH_PROVIDER.GOOGLE) {
      window.localStorage.setItem(STORAGE_KEY, provider);
    }
  } catch {
    /* ignore quota / private mode */
  }
}
