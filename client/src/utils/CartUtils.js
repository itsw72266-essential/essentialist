import toast from "react-hot-toast"
import SummaryApi from "../common/SummaryApi"
import Axios from "./Axios"
import AxiosToastError from "./AxiosToastError"

// -- Guest cart key in localStorage --
const GUEST_CART_KEY = "guest_cart"

// -- Helper for user login detection --
const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem("user")) // update if your auth logic is different
    return user && user._id
}

// -- Guest cart helpers --
const getGuestCart = () => JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []
const setGuestCart = (cart) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))

export const fetchCartItems = async () => {
    if (!isLoggedIn()) {
        return {
            success: true,
            data: getGuestCart() // Make sure the structure matches what the server returns
        }
    }
    try {
        const response = await Axios({
            ...SummaryApi.getCartItem
        })
        return response.data
    } catch (error) {
        AxiosToastError(error)
        return { success: false, data: [], error }
    }
}

export const addToCartProduct = async (product, qty = 1) => {
    if (!isLoggedIn()) {
        let cart = getGuestCart()
        const exist = cart.find(item => item._id === product._id)
        if (exist) {
            cart = cart.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            )
        } else {
            cart.push({
                _id: product._id,
                productId: product._id,
                quantity: qty,
                product // store full product details for guest cart
            })
        }
        setGuestCart(cart)
        toast.success("Added to cart")
        return { success: true, message: "Added to cart" }
    }
    try {
        const response = await Axios({
            ...SummaryApi.addTocart,
            data: {
                productId: product._id,
                quantity: qty
            }
        })
        const { data: responseData } = response
        if (responseData.success) {
            toast.success(responseData.message)
        }
        return responseData
    } catch (error) {
        AxiosToastError(error)
        return {}
    }
}

export const updateCartProductQty = async (cartItemId, newQty, product) => {
    if (!isLoggedIn()) {
        let cart = getGuestCart()
        cart = cart.map(item =>
            item._id === (product?._id || cartItemId)
                ? { ...item, quantity: newQty }
                : item
        )
        setGuestCart(cart)
        toast.success("Cart updated")
        return { success: true }
    }
    try {
        const response = await Axios({
            ...SummaryApi.updateCartItemQty,
            data: {
                _id: cartItemId,
                qty: newQty
            }
        })
        const { data: responseData } = response
        if (responseData.success) {
            toast.success("Cart updated")
        }
        return responseData
    } catch (error) {
        AxiosToastError(error)
        return {}
    }
}

export const deleteCartProduct = async (cartItemId, product) => {
    if (!isLoggedIn()) {
        let cart = getGuestCart()
        cart = cart.filter(item =>
            item._id !== (product?._id || cartItemId)
        )
        setGuestCart(cart)
        toast.success("Removed from cart")
        return { success: true }
    }
    try {
        const response = await Axios({
            ...SummaryApi.deleteCartItem,
            data: {
                _id: cartItemId
            }
        })
        const { data: responseData } = response
        if (responseData.success) {
            toast.success("Removed from cart")
        }
        return responseData
    } catch (error) {
        AxiosToastError(error)
        return {}
    }
}

// -- Helper to clear guest cart (optional, e.g. on login) --
export const clearGuestCart = () => setGuestCart([])