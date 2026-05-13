// Add this to src/lib/optimizedDataCache.js

export const getCachedProduct = unstable_cache(
  async (productId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/get-product-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return data?.data || null
  },
  (productId) => [`fast-product-${productId}`],
  {
    revalidate: 240, // 4 minutes
    tags: (productId) => [`product-${productId}`]
  }
)