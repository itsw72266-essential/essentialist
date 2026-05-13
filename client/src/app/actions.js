'use server'
import { revalidateTag } from 'next/cache'

const serverApiBase = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '')

export async function addCategory(formData) {
  await fetch(`${serverApiBase}/api/next/category/add-category`, {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(formData)),
  })
  revalidateTag('categories')
  revalidateTag('subcategories')
}