// utils/showLoginModal.js
export function showLoginModal() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-login')
    window.dispatchEvent(event)
  }
}