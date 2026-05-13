"use client"
import React, { useEffect, useState } from 'react';
// import { useGlobalContext } from '../providers/GlobalProvider';
import { FaCartShopping } from 'react-icons/fa6';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useGlobalContext } from '../providers/ReactQueryProvider';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const CartMobileLink = () => {
  const { t } = useTranslation();
  const { totalPrice, totalQty } = useGlobalContext();
  const cartItem = useSelector(state => state.cartItem.cart);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {
        cartItem?.[0] && (
          <div className='sticky bottom-4 p-2'>
            <div className='bg-pink-400 px-2 py-1 rounded text-neutral-100 text-sm flex items-center justify-between gap-3 lg:hidden'>
              <div className='flex items-center gap-2'>
                <div className='p-2 bg-pink-400 rounded w-fit'>
                  <FaCartShopping />
                </div>
                <div className='text-xs'>
                  <p>{t("cartDrawer.item", { count: totalQty })}</p>
                  <p>{DisplayPriceInRupees(totalPrice)}</p>
                </div>
              </div>
              <Link href="/cart" className='flex items-center gap-1'>
                <span className='text-sm'>{t("cartDrawer.viewCart")}</span>
                <FaCaretRight />
              </Link>
            </div>
          </div>
        )
      }
    </>
  );
};

export default CartMobileLink;
