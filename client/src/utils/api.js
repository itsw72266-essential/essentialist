export async function fetchProductDetails(productId) {
  try {
    const res = await fetch('/api/product/get-product-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  } catch (err) {
    throw err;
  }
}