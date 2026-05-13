// 'use client';

// import React, { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import Axios from "../utils/Axios";
// import SummaryApi from "../common/SummaryApi";
// import CardProduct from "./CardProduct";

// // --- LOCAL STORAGE HELPERS ---
// const HISTORY_KEY = "browsing_history_products";

// const getHistory = () => {
//   try {
//     if (typeof window !== 'undefined') {
//       const history = localStorage.getItem(HISTORY_KEY);
//       return history ? JSON.parse(history) : [];
//     }
//     return [];
//   } catch {
//     return [];
//   }
// };

// const setHistory = (products) => {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem(HISTORY_KEY, JSON.stringify(products));
//   }
// };

// // --- A more compact card for the home page history ---
// const CompactHistoryCard = ({ product, onClick }) => {
//   if (!product) return null;
//   return (
//     <div
//       className="flex-shrink-0 w-36 cursor-pointer group"
//       onClick={() => onClick(product)}
//     >
//       <div className="h-36 bg-slate-100 rounded-lg md:rounded-lg sm:rounded-full flex items-center justify-center p-2 overflow-hidden border border-gray-200">
//         <img
//           src={product.image && product.image[0]}
//           alt={product.name}
//           className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
//         />
//       </div>
//       <h3 className="text-xs text-gray-700 mt-2 line-clamp-2 h-8">
//         {product.name}
//       </h3>
//     </div>
//   );
// };

// const ProductRecommendations = ({ currentProductId, currentProductData }) => {
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   const [historyProducts, setHistoryProducts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const pathname = usePathname();
//   const router = useRouter();
//   const isHomePage = pathname === "/" || pathname === "/home";

//   // --- EFFECT 1: Add current product to history (only on product detail page) ---
//   useEffect(() => {
//     // This effect should only run when we have product data, i.e., on the detail page.
//     if (!currentProductId || !currentProductData?._id) return;

//     let history = getHistory();
//     // Remove the current product if it already exists to move it to the front.
//     history = history.filter((product) => product._id !== currentProductId);
//     // Add the fresh, complete product data to the beginning of the list.
//     history.unshift(currentProductData);
//     // Keep the history to a manageable size.
//     const updatedHistory = history.slice(0, 15);
//     setHistory(updatedHistory);
//   }, [currentProductId, currentProductData]);

//   // --- EFFECT 2: Load history and fetch related products ---
//   useEffect(() => {
//     // Always load browsing history from storage.
//     const storedHistory = getHistory();
//     setHistoryProducts(storedHistory);

//     // Only fetch related products if we are on a product detail page.
//     if (!isHomePage && currentProductData?.category?.[0]?._id) {
//       const fetchRelatedProducts = async () => {
//         setLoading(true);
//         try {
//           const response = await Axios({
//             // Using the broader category endpoint for better recommendations.
//             ...SummaryApi.getProductByCategory,
//             data: { id: currentProductData.category[0]._id },
//           });
//           if (response.data.success) {
//             const related = (response.data.data || []).filter(
//               (p) => p._id !== currentProductId
//             );
//             setRelatedProducts(related);
//           }
//         } catch (error) {
//           console.error("Error fetching related products:", error);
//           setRelatedProducts([]);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchRelatedProducts();
//     }
//   }, [isHomePage, currentProductData, currentProductId]); // Rerun when page or product changes.

//   const handleClickProduct = (product) => {
//     // Fixed routing - use the product/[slug] format instead of category/subcategory/product
//     if (!product?._id || !product?.name) return;
    
//     // Create a URL-friendly slug from the product name
//     const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + product._id;
    
//     // Navigate to the product page using the new format
//     router.push(`/product/${slug}`);
//   };
  
//   // Filter out the currently viewed product from the history list when on the detail page.
//   const displayHistory = isHomePage 
//     ? historyProducts 
//     : historyProducts.filter(p => p._id !== currentProductId);

//   // --- RENDER LOGIC ---

//   // On Home Page: Show only browsing history if it exists.
//   if (isHomePage) {
//     if (displayHistory.length === 0) return null;
//     return (
//       <section className="container mx-auto px-4 py-8">
//         <h2 className="text-2xl font-semibold text-black mb-4">
//           Recently Viewed
//         </h2>
//         <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-none">
//           {displayHistory.map((product) => (
//             <CompactHistoryCard
//               key={`history-${product._id}`}
//               product={product}
//               onClick={handleClickProduct}
//             />
//           ))}
//         </div>
//       </section>
//     );
//   }

//   // On Product Detail Page: Show Related Products then Browsing History.
//   return (
//     <section className="products-showcase bg-white py-8 rounded-lg shadow-sm">
//       <div className="container mx-auto px-4 space-y-12">
//         {/* Related Products Section */}
//         {relatedProducts.length > 0 && (
//           <div className="border-t pt-8">
//             <h2 className="text-2xl font-semibold text-black mb-6">
//               Related Products
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-2 md:flex
//                           gap-4 sm:gap-6 md:gap-20
//                           container mx-auto 
//                           overflow-x-auto scrollbar-none scroll-smooth">
//               {relatedProducts.map((product) => (
//                 <div key={`related-${product._id}`} className="flex-shrink-0 w-full sm:w-auto md:w-52">
//                   <CardProduct data={product} onClick={() => handleClickProduct(product)} />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Browsing History Section */}
//         {displayHistory.length > 0 && (
//           <div className="border-t pt-8">
//             <h2 className="text-2xl font-semibold text-black mb-6">
//               Your Browsing History
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-2 md:flex
//                           gap-4 sm:gap-6 md:gap-10
//                           container mx-auto 
//                           overflow-x-auto scrollbar-none scroll-smooth">
//               {displayHistory.map((product) => (
//                 <div key={`history-${product._id}`} className="flex-shrink-0 w-full sm:w-auto md:w-52">
//                   <CardProduct 
//                     data={product} 
//                     onClick={() => handleClickProduct(product)} 
//                     className="sm:rounded-full md:rounded-lg"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default ProductRecommendations;




'use client';

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardProduct from "./CardProduct";
import { valideURLConvert } from "../utils/valideURLConvert";

const HISTORY_KEY = "browsing_history_products";

const getHistory = () => {
  try {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    }
    return [];
  } catch {
    return [];
  }
};

const setHistory = (products) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(products));
  }
};

const CompactHistoryCard = ({ product, onClick }) => {
  if (!product) return null;
  return (
    <div
      className="flex-shrink-0 w-36 cursor-pointer group"
      onClick={() => onClick(product)}
    >
      <div className="h-36 bg-slate-100 rounded-lg md:rounded-lg sm:rounded-full flex items-center justify-center p-2 overflow-hidden border border-gray-200">
        <img
          src={product.image && product.image[0]}
          alt={product.name}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-xs text-gray-700 mt-2 line-clamp-2 h-8">
        {product.name}
      </h3>
    </div>
  );
};

const ProductRecommendations = ({ currentProductId, currentProductData }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [historyProducts, setHistoryProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/" || pathname === "/home";

  useEffect(() => {
    if (!currentProductId || !currentProductData?._id) return;

    let history = getHistory();
    history = history.filter((product) => product._id !== currentProductId);
    history.unshift(currentProductData);
    const updatedHistory = history.slice(0, 15);
    setHistory(updatedHistory);
  }, [currentProductId, currentProductData]);

  useEffect(() => {
    const storedHistory = getHistory();
    setHistoryProducts(storedHistory);

    if (!isHomePage && currentProductData?.category?.[0]?._id) {
      const fetchRelatedProducts = async () => {
        setLoading(true);
        try {
          const response = await Axios({
            ...SummaryApi.getProductByCategory,
            data: { id: currentProductData.category[0]._id },
          });
          if (response.data.success) {
            const related = (response.data.data || []).filter(
              (p) => p._id !== currentProductId
            );
            setRelatedProducts(related);
          }
        } catch (error) {
          console.error("Error fetching related products:", error);
          setRelatedProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRelatedProducts();
    }
  }, [isHomePage, currentProductData, currentProductId]);

  const handleClickProduct = (product) => {
    if (!product?._id || !product?.name) return;
    
    // Fast client-side navigation to /product/[slug] without additional API calls
    // The product/[slug]/page.jsx can parse the slug (e.g., extract ID from name-id format)
    // and fetch full details server-side or client-side as needed.
    const productSlug = `${valideURLConvert(product.name)}-${product._id}`;
    router.push(`/product/${productSlug}`);
  };
  
  const displayHistory = isHomePage 
    ? historyProducts 
    : historyProducts.filter(p => p._id !== currentProductId);

  if (isHomePage) {
    if (displayHistory.length === 0) return null;
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Recently Viewed
        </h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-none">
          {displayHistory.map((product) => (
            <CompactHistoryCard
              key={`history-${product._id}`}
              product={product}
              onClick={handleClickProduct}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="products-showcase bg-white py-8 rounded-lg shadow-sm">
      <div className="container mx-auto px-4 space-y-12">
        {relatedProducts.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:flex
                          gap-4 sm:gap-6 md:gap-20
                          container mx-auto 
                          overflow-x-auto scrollbar-none scroll-smooth">
              {relatedProducts.map((product) => (
                <div key={`related-${product._id}`} className="flex-shrink-0 w-full sm:w-auto md:w-52">
                  <CardProduct data={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {displayHistory.length > 0 && (
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Your Browsing History
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:flex
                          gap-4 sm:gap-6 md:gap-10
                          container mx-auto 
                          overflow-x-auto scrollbar-none scroll-smooth">
              {displayHistory.map((product) => (
                <div key={`history-${product._id}`} className="flex-shrink-0 w-full sm:w-auto md:w-52">
                  <CardProduct 
                    data={product} 
                    className="sm:rounded-full md:rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductRecommendations;