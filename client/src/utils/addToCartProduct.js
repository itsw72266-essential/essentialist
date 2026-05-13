import toast from "react-hot-toast"
import SummaryApi from "../common/SummaryApi"
import Axios from "./Axios"
import AxiosToastError from "./AxiosToastError"

// ---- Add this key for guest cart ----
const GUEST_CART_KEY = "guest_cart"

// ---- Helper for guest cart user detection ----
const isLoggedIn = () => {
    // You may want to use your own user store or a function to check if logged in
    const user = JSON.parse(localStorage.getItem("user")) // adjust this line as per your auth logic
    return user && user._id
}

// ---- Guest cart helpers ----
const getGuestCart = () => JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []

const setGuestCart = (cart) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))

// ---- Only change/additions are below ----

export const addToCartProduct = async (productId, qty) => {
    // Guest user logic
    if (!isLoggedIn()) {
        let cart = getGuestCart()
        const exist = cart.find(item => item._id === productId)
        if (exist) {
            cart = cart.map(item =>
                item._id === productId
                    ? { ...item, quantity: item.quantity + qty }
                    : item
            )
        } else {
            // You may want to fetch product details here if needed, for now just save id/qty
            cart.push({ _id: productId, quantity: qty })
        }
        setGuestCart(cart)
        toast.success("Added to cart")
        return { success: true, message: "Added to cart (guest)" }
    }

    // Logged in: keep your original code
    try {
        const response = await Axios({
            ...SummaryApi.addToCart,
            data: {
                quantity: qty,
                productId: productId
            }
        })

        const { data: responseData } = response

        console.log(responseData)
        if (responseData.success) {
            toast.success(responseData.message)
        }
        return responseData

    } catch (error) {
        AxiosToastError(error)
        return {}
    }
}

export const getCartItems = async () => {
    if (!isLoggedIn()) {
        // Guest cart
        return {
            success: true,
            cart: getGuestCart()
        }
    }

    // Logged in: keep your original code
    try {
        const response = await Axios({
            ...SummaryApi.getCartItems
        })

        const { data: responseData } = response

        if (responseData.success) {
            return responseData
        }
    } catch (error) {
        AxiosToastError(error)
        return error
    }
}