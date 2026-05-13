// src/server/catalog.js
'use server'

import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import SummaryApi, { baseURL, callSummaryApi } from '../common/SummaryApi'

const API_AVAILABLE = Boolean(baseURL)
const DEFAULT_CACHE_MINUTES = 5
const FALLBACK_TIMESTAMP = () => new Date().toISOString()

const clone = (value) => {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }
  } catch {
    // fall back to JSON branch below
  }

  try {
    return JSON.parse(JSON.stringify(value ?? null))
  } catch {
    return Array.isArray(value) ? [] : {}
  }
}

const toArray = (source) => {
  if (!source) return []
  if (Array.isArray(source)) return source

  if (Array.isArray(source?.data)) return source.data
  if (Array.isArray(source?.rows)) return source.rows
  if (Array.isArray(source?.result)) return source.result
  if (Array.isArray(source?.docs)) return source.docs

  if (Array.isArray(source?.data?.data)) return source.data.data
  if (Array.isArray(source?.data?.docs)) return source.data.docs
  if (Array.isArray(source?.data?.rows)) return source.data.rows
  if (Array.isArray(source?.data?.result)) return source.data.result

  return []
}

const sortByName = (list = []) =>
  [...list].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))

export const getCategories = cache(async () => {
  cacheLife('minutes', DEFAULT_CACHE_MINUTES)
  cacheTag('categories')

  if (!API_AVAILABLE) {
    console.warn('getCategories: NEXT_PUBLIC_API_URL not configured; returning []')
    return []
  }

  try {
    const response = await callSummaryApi(SummaryApi.getCategory, {
      cache: 'force-cache',
      next: { tags: ['categories'] },
      timeout: 12_000,
    })

    return sortByName(toArray(response))
  } catch (error) {
    console.error('getCategories error:', error)
    return []
  }
})

export const getSubCategories = cache(async () => {
  cacheLife('minutes', DEFAULT_CACHE_MINUTES)
  cacheTag('subcategories')

  if (!API_AVAILABLE) {
    console.warn('getSubCategories: NEXT_PUBLIC_API_URL not configured; returning []')
    return []
  }

  try {
    const response = await callSummaryApi(SummaryApi.getSubCategory, {
      payload: {},
      cache: 'force-cache',
      next: { tags: ['subcategories'] },
      timeout: 12_000,
    })

    return sortByName(toArray(response))
  } catch (error) {
    console.error('getSubCategories error:', error)
    return []
  }
})

export const getProductsByCategoryId = cache(async (categoryId) => {
  cacheLife('minutes', DEFAULT_CACHE_MINUTES)
  cacheTag(`products-${categoryId}`)

  if (!API_AVAILABLE) {
    console.warn(
      `getProductsByCategoryId: API unavailable during build; skipping fetch for ${categoryId}`
    )
    return []
  }

  if (!categoryId) {
    console.warn('getProductsByCategoryId called without a valid categoryId')
    return []
  }

  try {
    const response = await callSummaryApi(SummaryApi.getProductByCategory, {
      payload: { id: categoryId },
      cache: 'force-cache',
      next: { tags: [`products-${categoryId}`] },
      timeout: 12_000,
    })

    if (response?.success && Array.isArray(response?.data)) {
      return response.data
    }

    return toArray(response)
  } catch (error) {
    console.error(`getProductsByCategoryId error for ${categoryId}:`, error)
    return []
  }
})

export const getTopCategoryBundles = cache(async (limit = 8) => {
  cacheLife('minutes', DEFAULT_CACHE_MINUTES)

  const categories = await getCategories()
  if (!Array.isArray(categories) || categories.length === 0) return []

  const safeLimit = Math.max(1, Number(limit) || 1)
  const topCategories = categories.slice(0, safeLimit)

  const bundles = await Promise.all(
    topCategories.map(async (category) => {
      if (!category?._id) {
        return { category, products: [] }
      }

      const products = await getProductsByCategoryId(category._id)
      return { category, products }
    })
  )

  return bundles
})

export async function getNavigationSnapshot() {
  const generatedAt = FALLBACK_TIMESTAMP()

  try {
    const [categories, subCategories] = await Promise.all([
      getCategories(),
      getSubCategories(),
    ])

    return {
      categories: clone(categories),
      subCategories: clone(subCategories),
      generatedAt,
    }
  } catch (error) {
    console.error('getNavigationSnapshot error:', error)
    return {
      categories: [],
      subCategories: [],
      generatedAt,
      error: true,
    }
  }
}