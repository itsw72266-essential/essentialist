"use client";
import React, { useEffect, useState } from 'react'
// import { useGlobalContext } from '../providers/GlobalProvider'
import toast from 'react-hot-toast'
import AxiosToastError from '@/lib/axiosToastError'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";
import { isLoggedIn } from '../utils/guestCartUtils'
import { useGlobalContext } from '@/providers/ReactQueryProvider';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const AddToCartButton = ({ data }) => {
    const { t } = useTranslation()
    const { fetchCartItem, updateCartItem, deleteCartItem, addToCart } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails, setCartItemsDetails] = useState()

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            setLoading(true)
            
            // Using the more generic addToCart function that handles both guest and logged in users
            const response = await addToCart(data, 1)
            
            if (response.success) {
                // fetchCartItem will be called inside addToCart
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    //checking this item in cart or not
    useEffect(() => {
        const checkingitem = cartItem.some(item => item.productId._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = cartItem.find(item => item.productId._id === data._id)
        setQty(product?.quantity)
        setCartItemsDetails(product)
    }, [data, cartItem])

    const increaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
    
        const response = await updateCartItem(cartItemDetails?._id, qty+1)
        
        if(response.success){
                toast.success(t("cart.quantity"))
        }
    }

    const decreaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()
        if(qty === 1){
            deleteCartItem(cartItemDetails?._id)
        } else {
            const response = await updateCartItem(cartItemDetails?._id, qty-1)

            if(response.success){
                toast.success(t("cart.remove"))
            }
        }
    }
    
    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        <button onClick={decreaseQty} className='bg-pink-400 bg-yellow text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaMinus /></button>

                        <p className='flex-1 w-full font-semibold px-1 flex items-center justify-center'>{qty}</p>

                        <button onClick={increaseQty} className='bg-pink-400 bg-yellow text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaPlus /></button>
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='bg-pink-400 bg-yellow text-white px-2 lg:px-4 py-2 rounded'>
                        {loading ? <Loading /> : t("product.addToCart")}
                    </button>
                )
            }
        </div>
    )
}

export default AddToCartButton
