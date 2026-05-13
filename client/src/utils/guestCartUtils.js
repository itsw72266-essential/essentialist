// utils/guestCartUtils.js

import toast from "react-hot-toast";

/**
 * LocalStorage Keys
 */
export const GUEST_CART_KEY = "guest_cart";
export const GUEST_ADDRESSES_KEY = "guest_addresses";

/**
 * User Login Detection
 */
export const isLoggedIn = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        return !!(user && user._id);
    } catch {
        return false;
    }
};

/**
 * --- Guest Cart Utilities ---
 */

// Get all guest cart items
export const getGuestCart = () => {
    try {
        return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
    } catch {
        return [];
    }
};

// Set guest cart items
export const setGuestCart = (cart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

// Add item to guest cart
export const addItemToGuestCart = (product, quantity = 1) => {
    let cart = getGuestCart();
    const foundIdx = cart.findIndex(item => {
        // item.productId can be full object or id
        const id = item.productId._id || item.productId;
        return id === (product._id || product);
    });

    if (foundIdx > -1) {
        // Increment quantity
        cart[foundIdx].quantity += quantity;
    } else {
        cart.push({
            _id: Math.random().toString(36).substring(2, 15),
            quantity,
            productId: product, // Store the full product object for displaying cart contents
        });
    }
    setGuestCart(cart);
    return { success: true, message: "Item added to cart" };
};

// Update item quantity in guest cart
export const updateGuestCartItem = (itemId, quantity) => {
    let cart = getGuestCart();
    cart = cart.map(item =>
        item._id === itemId ? { ...item, quantity } : item
    );
    setGuestCart(cart);
    return { success: true, message: "Cart updated" };
};

// Remove an item from guest cart
export const removeItemFromGuestCart = (itemId) => {
    let cart = getGuestCart();
    cart = cart.filter(item => item._id !== itemId);
    setGuestCart(cart);
    return { success: true, message: "Item removed from cart" };
};

// Clear guest cart entirely
export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

/**
 * --- Guest Addresses Utilities ---
 */

// Get all guest addresses
export const getGuestAddresses = () => {
    try {
        return JSON.parse(localStorage.getItem(GUEST_ADDRESSES_KEY)) || [];
    } catch {
        return [];
    }
};

// Set guest addresses
export const setGuestAddresses = (addresses) => {
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(addresses));
};

// Add a guest address
export const addGuestAddress = (address) => {
    let addresses = getGuestAddresses();
    addresses.push({
        _id: Math.random().toString(36).substring(2, 15),
        ...address,
    });
    setGuestAddresses(addresses);
    return { success: true, message: "Address added" };
};

// Update a guest address by _id
export const updateGuestAddress = (addressId, newAddress) => {
    let addresses = getGuestAddresses();
    addresses = addresses.map(addr =>
        addr._id === addressId ? { ...addr, ...newAddress } : addr
    );
    setGuestAddresses(addresses);
    return { success: true, message: "Address updated" };
};

// Remove a guest address by _id
export const removeGuestAddress = (addressId) => {
    let addresses = getGuestAddresses();
    addresses = addresses.filter(addr => addr._id !== addressId);
    setGuestAddresses(addresses);
    return { success: true, message: "Address removed" };
};

// Clear guest addresses entirely
export const clearGuestAddresses = () => {
    localStorage.removeItem(GUEST_ADDRESSES_KEY);
};

/**
 * --- Merge Guest Cart & Address Data After Login ---
 *
 * Call this after login, or let your login API handle merging
 * and just clear local guest data.
 *
 * @param {function} apiClient - Your axios/Api instance
 * @returns {Promise<void>}
 */
export const mergeCartAndAddressAfterLogin = async (apiClient) => {
    const guestCart = getGuestCart();
    const guestAddresses = getGuestAddresses();

    // If nothing to merge, skip API
    if (guestCart.length === 0 && guestAddresses.length === 0) {
        return;
    }

    try {
        // Send both to your login merge endpoint if needed
        await apiClient({
            url: '/api/auth/merge-guest-data',
            method: 'post',
            data: {
                guestCart: guestCart.map(item => ({
                    productId: item.productId._id || item.productId,
                    quantity: item.quantity,
                })),
                guestAddresses,
            },
        });

        // Clear guest data after successful merge
        clearGuestCart();
        clearGuestAddresses();
        toast.success("Guest cart and addresses added to your account");
    } catch (error) {
        // Optionally handle error
        console.error("Error merging guest data:", error);
    }
};

/**
 * Utility: Clear all guest data (cart + addresses)
 */
export const clearAllGuestData = () => {
    clearGuestCart();
    clearGuestAddresses();
};