/**
 * Persists the logged-in user snapshot for rehydration after full reload.
 * Key `user` matches `isLoggedIn()` in guestCartUtils.js.
 */
export const AUTH_USER_STORAGE_KEY = 'user';

export function readPersistedUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed._id) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writePersistedUser(user) {
  if (typeof window === 'undefined') return;
  if (user && typeof user === 'object' && user._id) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearPersistedUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function hasAuthTokens() {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem('accesstoken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('refreshToken')
  );
}
