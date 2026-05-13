// app/actions.js (example – call from form)
'use server'
import { revalidateTag } from 'next/cache'

export async function addCategory(formData) {
  // Your add logic (fetch to backend)
  await fetch(`${baseURL}/api/category/add-category`, { method: 'POST', body: JSON.stringify(Object.fromEntries(formData)) })
  revalidateTag('categories') // Invalidates cache – next page load fetches fresh (<300ms global)
  revalidateTag('subcategories') // If affected
}