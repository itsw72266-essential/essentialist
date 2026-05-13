// store/cartProduct.js
import { createSlice } from "@reduxjs/toolkit";

const GUEST_CART_KEY = "guest_cart";

const safeParse = (val, fallback) => {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const getGuestCart = () => {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(GUEST_CART_KEY), []) || [];
};

const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  const user = safeParse(localStorage.getItem("user"), null);
  return Boolean(user && user._id);
};

const initialState = {
  cart: isLoggedIn() ? [] : getGuestCart(),
};

const slice = createSlice({
  name: "cartItem",
  initialState,
  reducers: {
    handleAddItemCart: (state, action) => {
      state.cart = Array.isArray(action.payload) ? [...action.payload] : [];
      try {
        if (!isLoggedIn()) {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.cart));
        }
      } catch {}
    },
    // call this ONLY after confirmed successful payment
    handleClearCart: (state) => {
      state.cart = [];
      try {
        if (!isLoggedIn()) {
          localStorage.removeItem(GUEST_CART_KEY);
        }
      } catch {}
    },
  },
});

export const { handleAddItemCart, handleClearCart } = slice.actions;
export default slice.reducer;