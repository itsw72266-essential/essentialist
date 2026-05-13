// utils/guestCartUtils.js
import toast from "react-hot-toast";

// ---- Guest cart key for localStorage ----
export const GUEST_CART_KEY = "guest_cart";

// ---- Helper for guest cart user detection ----
export const isLoggedIn = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return user && user._id;
};

// ---- Guest cart helpers ----
export const getGuestCart = () => JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];

export const setGuestCart = (cart) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));

// Add item to guest cart
export const addItemToGuestCart = (product, quantity = 1) => {
    let cart = getGuestCart();
    const existingItem = cart.find(item => item.productId._id === product._id);
    
    if (existingItem) {
        // Update quantity if item exists
        cart = cart.map(item => 
            item.productId._id === product._id 
                ? { ...item, quantity: item.quantity + quantity } 
                : item
        );
    } else {
        // Add new item
        cart.push({ 
            _id: Math.random().toString(36).substring(2, 15), // Generate a temp ID
            quantity: quantity,
            productId: product // Store the entire product to display in cart
        });
    }
    
    setGuestCart(cart);
    return { success: true, message: "Item added to cart" };
};

// Update item in guest cart
export const updateGuestCartItem = (itemId, quantity) => {
    let cart = getGuestCart();
    
    cart = cart.map(item => 
        item._id === itemId 
            ? { ...item, quantity: quantity } 
            : item
    );
    
    setGuestCart(cart);
    return { success: true, message: "Cart updated" };
};

// Remove item from guest cart
export const removeItemFromGuestCart = (itemId) => {
    let cart = getGuestCart();
    cart = cart.filter(item => item._id !== itemId);
    
    setGuestCart(cart);
    return { success: true, message: "Item removed from cart" };
};

// Merge guest cart with user cart after login
export const mergeCartAfterLogin = async (apiClient) => {
    const guestCart = getGuestCart();
    
    if (guestCart.length === 0) return;
    
    // Process each item in guest cart
    for (const item of guestCart) {
        try {
            // Add item to user's cart in the database
            await apiClient({
                url: '/api/cart/create',
                method: 'post',
                data: {
                    productId: item.productId._id,
                    quantity: item.quantity
                }
            });
        } catch (error) {
            console.error("Error merging cart item:", error);
        }
    }
    
    // Clear guest cart after merging
    localStorage.removeItem(GUEST_CART_KEY);
    toast.success("Your guest cart items have been added to your account");
};