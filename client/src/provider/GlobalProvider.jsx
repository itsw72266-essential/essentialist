"use client"
import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import { handleAddItemCart } from "../store/cartProduct";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import { handleAddAddress } from "../store/addressSlice";
import { setOrder } from "../store/orderSlice";

// --- Guest cart/address utils ---
import {
  isLoggedIn,
  getGuestCart,
  addItemToGuestCart,
  updateGuestCartItem,
  removeItemFromGuestCart,
  getGuestAddresses,
  mergeCartAndAddressAfterLogin,
  clearAllGuestData,
} from "../utils/guestCartUtils";

export const GlobalContext = createContext(null);

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [totalPrice, setTotalPrice] = useState(0);
  const [notDiscountTotalPrice, setNotDiscountTotalPrice] = useState(0);
  const [totalQty, setTotalQty] = useState(0);

  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state?.user);

  /**
   * Fetch cart items:
   * - If guest, fetch from localStorage
   * - If logged in, fetch from API
   */
  const fetchCartItem = async () => {
    try {
      if (!isLoggedIn()) {
        // Guest: get from localStorage
        const guestCart = getGuestCart();
        dispatch(handleAddItemCart(guestCart));
        return;
      }

      // Logged in: fetch from backend
      const response = await Axios({
        ...SummaryApi.getCartItem,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(handleAddItemCart(responseData.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Add to cart: handles both guest and logged-in
   */
  const addToCart = async (product, quantity = 1) => {
    try {
      if (!isLoggedIn()) {
        const result = addItemToGuestCart(product, quantity);
        if (result.success) {
          toast.success(result.message);
          fetchCartItem();
        }
        return result;
      }

      // Logged in
      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: product._id,
        },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
      return responseData;
    } catch (error) {
      AxiosToastError(error);
      return { success: false, error: true };
    }
  };

  /**
   * Update cart item qty
   */
  const updateCartItem = async (id, qty) => {
    try {
      if (!isLoggedIn()) {
        const result = updateGuestCartItem(id, qty);
        if (result.success) {
          fetchCartItem();
        }
        return result;
      }

      const response = await Axios({
        ...SummaryApi.updateCartItemQty,
        data: {
          _id: id,
          qty: qty,
        },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        fetchCartItem();
        return responseData;
      }
    } catch (error) {
      AxiosToastError(error);
      return error;
    }
  };

  /**
   * Delete cart item
   */
  const deleteCartItem = async (cartId) => {
    try {
      if (!isLoggedIn()) {
        const result = removeItemFromGuestCart(cartId);
        if (result.success) {
          toast.success(result.message);
          fetchCartItem();
        }
        return result;
      }

      const response = await Axios({
        ...SummaryApi.deleteCartItem,
        data: {
          _id: cartId,
        },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  /**
   * Calculate totals whenever cart changes
   */
  useEffect(() => {
    const qty = cartItem.reduce((preve, curr) => preve + curr.quantity, 0);
    setTotalQty(qty);

    const tPrice = cartItem.reduce((preve, curr) => {
      const priceAfterDiscount = pricewithDiscount(
        curr?.productId?.price,
        curr?.productId?.discount
      );
      return preve + priceAfterDiscount * curr.quantity;
    }, 0);
    setTotalPrice(tPrice);

    const notDiscountPrice = cartItem.reduce(
      (preve, curr) => preve + curr?.productId?.price * curr.quantity,
      0
    );
    setNotDiscountTotalPrice(notDiscountPrice);
  }, [cartItem]);

  /**
   * Handle logout: clear all localStorage and redux cart
   */
   const handleLogoutOut = () => {
    localStorage.clear();
    dispatch(handleAddItemCart([]));
    // ...clear other slices if needed...
  };

  /**
   * Fetch address (only for logged in)
   */
 /*  const fetchAddress = async () => {
    try {
      if (!isLoggedIn()) return; // Skip for guest users
      const response = await Axios({
        ...SummaryApi.getAddress,
      });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(handleAddAddress(responseData.data));
      }
    } catch (error) {
      // AxiosToastError(error)
    }
  }; */

  /**
   * Fetch order history (only for logged in)
   */
//   const fetchOrder = async () => {
//     try {
//       if (!isLoggedIn()) return; // Skip for guest users
//       const response = await Axios({
//         ...SummaryApi.getOrderItems,
//       });
//       const { data: responseData } = response;
//       if (responseData.success) {
//         dispatch(setOrder(responseData.data));
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };


     const fetchAddress = async()=>{
      try {
        const response = await Axios({
          ...SummaryApi.getAddress
        })
        const { data : responseData } = response

        if(responseData.success){
          dispatch(handleAddAddress(responseData.data))
        }
      } catch (error) {
          // AxiosToastError(error)
      }
    }
    
    const fetchOrder = async()=>{
      try {
        const response = await Axios({
          ...SummaryApi.getOrderItems,
        })
        const { data : responseData } = response

        if(responseData.success){
            dispatch(setOrder(responseData.data))
        }
      } catch (error) {
        console.log(error)
      }
    }

  
  useEffect(() => {
    if (isLoggedIn()) {
      // Merge guest cart/address only ONCE after login
      mergeCartAndAddressAfterLogin(Axios).then(() => {
        fetchCartItem();
        fetchAddress();
        fetchOrder();
      });
    } else {
      // Guest: only fetch cart from localStorage
      fetchCartItem();
    }
    // Do not call handleLogoutOut here!
  }, [user]);


  return (
    <GlobalContext.Provider value={{
      fetchCartItem,
      updateCartItem,
      deleteCartItem,
      addToCart,
      fetchAddress,
      totalPrice,
      totalQty,
      notDiscountTotalPrice,
      fetchOrder,
      handleLogoutOut, // only call on actual logout
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;