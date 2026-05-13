// "use client";

// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { useDispatch, useSelector } from "react-redux";
// import toast from "react-hot-toast";

// import Axios from "@/utils/Axios";
// import SummaryApi from "@/common/SummaryApi";
// import AxiosToastError from "@/utils/AxiosToastError";
// import { pricewithDiscount } from "@/utils/PriceWithDiscount";
// import { handleAddItemCart } from "@/store/cartProduct";
// import { handleAddAddress } from "@/store/addressSlice";
// import { setOrder } from "@/store/orderSlice";
// import {
//   isLoggedIn,
//   getGuestCart,
//   addItemToGuestCart,
//   updateGuestCartItem,
//   removeItemFromGuestCart,
//   mergeCartAndAddressAfterLogin,
// } from "@/utils/guestCartUtils";

// const GlobalContext = createContext(null);
// export const useGlobalContext = () => useContext(GlobalContext);

// export default function ReactQueryProvider({ children }) {
//   const [client] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 60_000,
//             refetchOnWindowFocus: false,
//             retry: 1,
//           },
//         },
//       })
//   );

//   return (
//     <QueryClientProvider client={client}>
//       <GlobalStateProvider>{children}</GlobalStateProvider>
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   );
// }

// function GlobalStateProvider({ children }) {
//   const dispatch = useDispatch();
//   const cartItem = useSelector((state) => state.cartItem.cart);
//   const user = useSelector((state) => state.user);

//   const [totalPrice, setTotalPrice] = useState(0);
//   const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
//   const [totalQty, setTotalQty] = useState(0);

//   const fetchCartItem = useCallback(async () => {
//     try {
//       if (!isLoggedIn()) {
//         dispatch(handleAddItemCart(getGuestCart()));
//         return;
//       }

//       const { data } = await Axios(SummaryApi.getCartItem);
//       if (data.success) dispatch(handleAddItemCart(data.data));
//     } catch (error) {
//       console.error("fetchCartItem", error);
//     }
//   }, [dispatch]);

//   const addToCart = useCallback(
//     async (product, quantity = 1) => {
//       try {
//         if (!isLoggedIn()) {
//           const result = addItemToGuestCart(product, quantity);
//           if (result.success) {
//             toast.success(result.message);
//             fetchCartItem();
//           }
//           return result;
//         }

//         const { data } = await Axios({
//           ...SummaryApi.addTocart,
//           data: { productId: product._id },
//         });
//         if (data.success) {
//           toast.success(data.message);
//           fetchCartItem();
//         }
//         return data;
//       } catch (error) {
//         AxiosToastError(error);
//         return { success: false, error: true };
//       }
//     },
//     [fetchCartItem]
//   );

//   const updateCartItem = useCallback(
//     async (id, qty) => {
//       try {
//         if (!isLoggedIn()) {
//           const result = updateGuestCartItem(id, qty);
//           if (result.success) fetchCartItem();
//           return result;
//         }

//         const { data } = await Axios({
//           ...SummaryApi.updateCartItemQty,
//           data: { _id: id, qty },
//         });
//         if (data.success) fetchCartItem();
//         return data;
//       } catch (error) {
//         AxiosToastError(error);
//         return { success: false, error: true };
//       }
//     },
//     [fetchCartItem]
//   );

//   const deleteCartItem = useCallback(
//     async (cartId) => {
//       try {
//         if (!isLoggedIn()) {
//           const result = removeItemFromGuestCart(cartId);
//           if (result.success) {
//             toast.success(result.message);
//             fetchCartItem();
//           }
//           return result;
//         }

//         const { data } = await Axios({
//           ...SummaryApi.deleteCartItem,
//           data: { _id: cartId },
//         });
//         if (data.success) {
//           toast.success(data.message);
//           fetchCartItem();
//         }
//         return data;
//       } catch (error) {
//         AxiosToastError(error);
//         return { success: false, error: true };
//       }
//     },
//     [fetchCartItem]
//   );

//   const fetchAddress = useCallback(async () => {
//     try {
//       const { data } = await Axios(SummaryApi.getAddress);
//       if (data.success) dispatch(handleAddAddress(data.data));
//     } catch (error) {
//       // silently ignore (matches prior behavior)
//     }
//   }, [dispatch]);

//   const fetchOrder = useCallback(async () => {
//     try {
//       const { data } = await Axios(SummaryApi.getOrderItems);
//       if (data.success) dispatch(setOrder(data.data));
//     } catch (error) {
//       console.error("fetchOrder", error);
//     }
//   }, [dispatch]);

//   const handleLogoutOut = useCallback(() => {
//     if (typeof window !== "undefined") {
//       localStorage.clear();
//     }
//     dispatch(handleAddItemCart([]));
//     // add more slice resets here if/when needed
//   }, [dispatch]);

//   useEffect(() => {
//     const qty = cartItem.reduce((acc, item) => acc + item.quantity, 0);
//     setTotalQty(qty);

//     const subtotal = cartItem.reduce((acc, item) => {
//       const priceAfterDiscount = pricewithDiscount(
//         item?.productId?.price,
//         item?.productId?.discount
//       );
//       return acc + priceAfterDiscount * item.quantity;
//     }, 0);
//     setTotalPrice(subtotal);

//     const undiscounted = cartItem.reduce(
//       (acc, item) => acc + (item?.productId?.price || 0) * item.quantity,
//       0
//     );
//     setNotDiscountTotalPrice(undiscounted);
//   }, [cartItem]);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     if (isLoggedIn()) {
//       mergeCartAndAddressAfterLogin(Axios).finally(() => {
//         fetchCartItem();
//         fetchAddress();
//         fetchOrder();
//       });
//     } else {
//       fetchCartItem();
//     }
//   }, [user, fetchCartItem, fetchAddress, fetchOrder]);

//   const contextValue = useMemo(
//     () => ({
//       fetchCartItem,
//       addToCart,
//       updateCartItem,
//       deleteCartItem,
//       fetchAddress,
//       fetchOrder,
//       handleLogoutOut,
//       totalPrice,
//       totalQty,
//       notDiscountTotalPrice,
//     }),
//     [
//       addToCart,
//       deleteCartItem,
//       fetchAddress,
//       fetchCartItem,
//       fetchOrder,
//       handleLogoutOut,
//       notDiscountTotalPrice,
//       totalPrice,
//       totalQty,
//       updateCartItem,
//     ]
//   );

//   return (
//     <GlobalContext.Provider value={contextValue}>
//       {children}
//     </GlobalContext.Provider>
//   );
// }






// client/src/providers/ReactQueryProvider.jsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useDispatch, useSelector } from "react-redux";

import Axios from "@/backend/http/legacyClient";
import SummaryApi from "@/backend/contracts/summaryApi";
import { pricewithDiscount } from "@/utils/PriceWithDiscount";
import { handleAddItemCart } from "@/store/cartProduct";
import { logout } from "@/store/userSlice";
import {
  isLoggedIn,
  mergeCartAndAddressAfterLogin,
} from "@/utils/guestCartUtils";
import {
  useCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  CART_QUERY_KEY,
} from "@/hooks/queries/useCartQueries";
import {
  useAddressesQuery,
  ADDRESS_QUERY_KEY,
} from "@/hooks/queries/useAddressQuery";
import {
  useOrdersQuery,
  ORDERS_QUERY_KEY,
} from "@/hooks/queries/useOrdersQuery";
import { useLanguageSync } from "@/hooks/useLanguageSync";

const GlobalContext = createContext(null);
export const useGlobalContext = () => useContext(GlobalContext);

export default function ReactQueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <GlobalStateProvider>{children}</GlobalStateProvider>
      {process.env.NODE_ENV !== "production" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}

function GlobalStateProvider({ children }) {
  useLanguageSync();

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const userId = user?._id ?? null;

  const {
    refetch: refetchCart,
    isFetching: isCartFetching,
  } = useCartQuery({ enabled: typeof window !== "undefined" });

  const { refetch: refetchAddress } = useAddressesQuery({
    enabled: typeof window !== "undefined",
    syncToRedux: true,
  });

  const { refetch: refetchOrders } = useOrdersQuery({
    enabled: typeof window !== "undefined",
    syncToRedux: true,
  });

  const addToCartMutation = useAddToCartMutation();
  const updateCartItemMutation = useUpdateCartItemMutation();
  const deleteCartItemMutation = useDeleteCartItemMutation();

  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

  useEffect(() => {
    const qty = cartItem.reduce((acc, item) => acc + item.quantity, 0);
    setTotalQty(qty);

    const subtotal = cartItem.reduce((acc, item) => {
      const priceAfterDiscount = pricewithDiscount(
        item?.productId?.price,
        item?.productId?.discount
      );
      return acc + priceAfterDiscount * item.quantity;
    }, 0);
    setTotalPrice(subtotal);

    const undiscounted = cartItem.reduce(
      (acc, item) => acc + (item?.productId?.price || 0) * item.quantity,
      0
    );
    setNotDiscountTotalPrice(undiscounted);
  }, [cartItem]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isLoggedIn()) {
      mergeCartAndAddressAfterLogin(Axios).finally(() => {
        refetchCart();
        refetchAddress();
        refetchOrders();
      });
    } else {
      refetchCart();
    }
  }, [userId, refetchAddress, refetchCart, refetchOrders]);

  const addToCart = useCallback(
    (product, quantity = 1) =>
      addToCartMutation.mutateAsync({ product, quantity }),
    [addToCartMutation]
  );

  const updateCartItem = useCallback(
    (id, qty) => updateCartItemMutation.mutateAsync({ id, qty }),
    [updateCartItemMutation]
  );

  const deleteCartItem = useCallback(
    (cartId) => deleteCartItemMutation.mutateAsync({ cartId }),
    [deleteCartItemMutation]
  );

  const fetchCartItem = useCallback(() => refetchCart(), [refetchCart]);
  const fetchAddress = useCallback(() => refetchAddress(), [refetchAddress]);
  const fetchOrder = useCallback(() => refetchOrders(), [refetchOrders]);

  const handleLogoutOut = useCallback(() => {
    dispatch(logout());
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    dispatch(handleAddItemCart([]));
    queryClient.removeQueries({ queryKey: CART_QUERY_KEY });
    queryClient.removeQueries({ queryKey: ADDRESS_QUERY_KEY });
    queryClient.removeQueries({ queryKey: ORDERS_QUERY_KEY });
    queryClient.removeQueries({ queryKey: ["user-profile"] });
  }, [dispatch, queryClient]);

  const contextValue = useMemo(
    () => ({
      user,
      fetchCartItem,
      addToCart,
      updateCartItem,
      deleteCartItem,
      fetchAddress,
      fetchOrder,
      handleLogoutOut,
      totalPrice,
      totalQty,
      notDiscountTotalPrice,
      cartIsUpdating:
        isCartFetching ||
        addToCartMutation.isPending ||
        updateCartItemMutation.isPending ||
        deleteCartItemMutation.isPending,
    }),
    [
      user,
      addToCart,
      addToCartMutation.isPending,
      deleteCartItem,
      deleteCartItemMutation.isPending,
      fetchAddress,
      fetchCartItem,
      fetchOrder,
      handleLogoutOut,
      isCartFetching,
      notDiscountTotalPrice,
      totalPrice,
      totalQty,
      updateCartItem,
      updateCartItemMutation.isPending,
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
