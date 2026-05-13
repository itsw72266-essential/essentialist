// client/src/hooks/queries/useCartQueries.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import AxiosToastError from "@/utils/AxiosToastError";
import {
  isLoggedIn,
  getGuestCart,
  addItemToGuestCart,
  updateGuestCartItem,
  removeItemFromGuestCart,
} from "@/utils/guestCartUtils";
import { handleAddItemCart } from "@/store/cartProduct";

export const CART_QUERY_KEY = ["cart"];

const normaliseCart = (payload) => (Array.isArray(payload) ? payload : []);

const syncGuestCart = (dispatch) => {
  if (typeof window === "undefined") return [];
  const guestCart = normaliseCart(getGuestCart());
  dispatch(handleAddItemCart(guestCart));
  return guestCart;
};

export function useCartQuery({ enabled = true } = {}) {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: CART_QUERY_KEY,
    enabled,
    queryFn: async () => {
      if (!isLoggedIn()) {
        return syncGuestCart(dispatch);
      }

      const response = await Axios(SummaryApi.getCartItem);
      const payload = normaliseCart(response?.data?.data);
      dispatch(handleAddItemCart(payload));
      return payload;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

const handleGuestAdd = (product, quantity) => {
  const result = addItemToGuestCart(product, quantity);
  if (!result?.success) {
    throw new Error(result?.message || "Unable to add item to cart.");
  }
  toast.success(result?.message || "Added to cart.");
  return result;
};

const handleGuestUpdate = (id, qty) => {
  const result = updateGuestCartItem(id, qty);
  if (!result?.success) {
    throw new Error(result?.message || "Unable to update cart item.");
  }
  toast.success(result?.message || "Cart updated.");
  return result;
};

const handleGuestDelete = (cartId) => {
  const result = removeItemFromGuestCart(cartId);
  if (!result?.success) {
    throw new Error(result?.message || "Unable to remove cart item.");
  }
  toast.success(result?.message || "Item removed.");
  return result;
};

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      try {
        if (!product?._id) {
          throw new Error("Product is required.");
        }

        if (!isLoggedIn()) {
          return handleGuestAdd(product, quantity);
        }

        const response = await Axios({
          ...SummaryApi.addTocart,
          data: { productId: product._id, qty: quantity },
        });
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
        return response?.data;
      } catch (error) {
        AxiosToastError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, qty }) => {
      try {
        if (!id) throw new Error("Cart ID is required.");

        if (!isLoggedIn()) {
          return handleGuestUpdate(id, qty);
        }

        const response = await Axios({
          ...SummaryApi.updateCartItemQty,
          data: { _id: id, qty },
        });
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
        return response?.data;
      } catch (error) {
        AxiosToastError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useDeleteCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartId }) => {
      try {
        if (!cartId) throw new Error("Cart ID is required.");

        if (!isLoggedIn()) {
          return handleGuestDelete(cartId);
        }

        const response = await Axios({
          ...SummaryApi.deleteCartItem,
          data: { _id: cartId },
        });
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
        return response?.data;
      } catch (error) {
        AxiosToastError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}