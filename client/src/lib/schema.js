// Schema.org implementation for structured data
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EssentialistMakeupStore",
    "url": "https://www.esmakeupstore.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.esmakeupstore.com/assets/logo.jpg"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+237655225569",
      "contactType": "customer service"
    }
  };
};

export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EssentialistMakeupStore",
    "url": "https://www.esmakeupstore.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.esmakeupstore.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

export const generateProductSchema = (product) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "url": `https://www.esmakeupstore.com/product/${product._id}`,
      "priceCurrency": "XAF",
      "price": product.price,
      "ratings":product.ratings,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "brand": {
      "@type": "Brand",
      "name": product.brand || "EssentialistMakeupStore"
    }
  };
};