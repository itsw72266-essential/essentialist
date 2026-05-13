// 'use client'
// import { useEffect } from 'react';
// import { IoClose } from 'react-icons/io5';
// import { useGlobalContext } from '../providers/GlobalProvider';
// import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
// import { FaCaretRight } from "react-icons/fa";
// import { useSelector, useDispatch } from 'react-redux';
// import AddToCartButton from './AddToCartButton';
// import { pricewithDiscount } from '../utils/PriceWithDiscount';
// import imageEmpty from '/public/assets/empty_cart.avif';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';

// const getStoredUser = () => {
//   try {
//     const user = JSON.parse(localStorage.getItem('user'));
//     return user;
//   } catch {
//     return null;
//   }
// };

// const DisplayCartItem = ({ close }) => {
//   const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
//   const cartItem = useSelector(state => state.cartItem.cart);
//   const authUser = useSelector(state => state.auth?.user);
//   const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const redirectToCheckoutPage = () => {
//     router.push("/checkout");
//     if (close) close();
//   };

//   const user = authUser || getStoredUser();
//   const isUserAuthenticated = !!(isAuthenticated || user);

//   return (
//     <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
//       <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto relative'>
//         <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
//           <h2 className='font-semibold'>Cart</h2>
//           <Link href="/" className='lg:hidden'>
//             <IoClose size={25} />
//           </Link>
//           <button onClick={close} className='hidden lg:block'>
//             <IoClose size={25} />
//           </button>
//         </div>

//         <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
//           {cartItem[0] ? (
//             <>
//               <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
//                 <p>Your total savings</p>
//                 <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
//               </div>
//               <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
//                 {cartItem.map((item) => (
//                   <div key={item?._id + "cartItemDisplay"} className='flex w-full gap-4'>
//                     <div className='w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded'>
//                       <Image
//                         src={item?.productId?.image[0]}
//                         className='object-scale-down w-full h-full'
//                         alt={item?.productId?.name || "Product"}
//                         width={64}
//                         height={64}
//                       />
//                     </div>
//                     <div className='w-full max-w-sm text-xs'>
//                       <p className='text-xs text-ellipsis line-clamp-2'>{item?.productId?.name}</p>
//                       <p className='text-neutral-400'>{item?.productId?.unit}</p>
//                       <p className='font-semibold'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}</p>
//                     </div>
//                     <div>
//                       <AddToCartButton data={item?.productId} />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className='bg-white p-4'>
//                 <h3 className='font-semibold'>Bill details</h3>
//                 <div className='flex gap-4 justify-between ml-1'>
//                   <p>Items total</p>
//                   <p className='flex items-center gap-2'>
//                     <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
//                     <span>{DisplayPriceInRupees(totalPrice)}</span>
//                   </p>
//                 </div>
//                 <div className='flex gap-4 justify-between ml-1'>
//                   <p>Quantity total</p>
//                   <p className='flex items-center gap-2'>{totalQty} item</p>
//                 </div>
//                 <div className='flex gap-4 justify-between ml-1'>
//                   <p>Delivery Charge</p>
//                   <p className='flex items-center gap-2'>Free</p>
//                 </div>
//                 <div className='font-semibold flex items-center justify-between gap-4'>
//                   <p>Grand total</p>
//                   <p>{DisplayPriceInRupees(totalPrice)}</p>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className='bg-white flex flex-col justify-center items-center'>
//               <Image
//                 src={imageEmpty}
//                 className='w-full h-full object-scale-down'
//                 alt="Empty cart"
//                 width={250}
//                 height={190}
//               />
//               <Link onClick={close} href={"/"} className='block bg-pink-400 px-4 py-2 text-white rounded mt-4'>Shop Now</Link>
//             </div>
//           )}
//         </div>

//         {cartItem[0] && (
//           <div className='p-2'>
//             <div className='bg-pink-400 text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between'>
//               <div>
//                 {DisplayPriceInRupees(totalPrice)}
//               </div>
//               <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
//                 Proceed
//                 <span><FaCaretRight /></span>
//               </button>
//             </div>
//             {!isUserAuthenticated &&
//               <div className='mt-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded text-center'>
//                 Proceeding as guest. You can order and pay on delivery without logging in.
//               </div>
//             }
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default DisplayCartItem;





'use client'
import { useEffect, memo } from 'react';
import { IoClose } from 'react-icons/io5';
// import { useGlobalContext } from '../providers/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { FaCaretRight } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import AddToCartButton from './AddToCartButton';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
// import imageEmpty from '/public/assets/empty_cart.avif';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGlobalContext } from '@/providers/ReactQueryProvider';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// Move this outside component to avoid recreation on each render
const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const CartItem = memo(({ item }) => {
  const { t } = useTranslation();

  return (
    <div className='flex w-full gap-4'>
      <div className='w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded'>
        <Image
          src={item?.productId?.image[0]}
          className='object-scale-down w-full h-full'
          alt={item?.productId?.name || t("product.product", "Product")}
          width={64}
          height={64}
          priority={true}
          loading="eager"
        />
      </div>
      <div className='w-full max-w-sm text-xs'>
        <p className='text-xs text-ellipsis line-clamp-2'>{item?.productId?.name}</p>
        <p className='text-neutral-400'>{item?.productId?.unit}</p>
        <p className='font-semibold'>{DisplayPriceInRupees(pricewithDiscount(item?.productId?.price, item?.productId?.discount))}</p>
      </div>
      <div>
        <AddToCartButton data={item?.productId} />
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

const BillDetails = memo(({ notDiscountTotalPrice, totalPrice, totalQty }) => {
  const { t } = useTranslation();

  return (
    <div className='bg-white p-4'>
      <h3 className='font-semibold'>{t("cartDrawer.billDetails")}</h3>
      <div className='flex gap-4 justify-between ml-1'>
        <p>{t("cartDrawer.itemsTotal")}</p>
        <p className='flex items-center gap-2'>
          <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
          <span>{DisplayPriceInRupees(totalPrice)}</span>
        </p>
      </div>
      <div className='flex gap-4 justify-between ml-1'>
        <p>{t("cartDrawer.quantityTotal")}</p>
        <p className='flex items-center gap-2'>{t("cartDrawer.item", { count: totalQty })}</p>
      </div>
      <div className='flex gap-4 justify-between ml-1'>
        <p>{t("cartDrawer.deliveryCharge")}</p>
        <p className='flex items-center gap-2'>{t("cartDrawer.free")}</p>
      </div>
      <div className='font-semibold flex items-center justify-between gap-4'>
        <p>{t("cartDrawer.grandTotal")}</p>
        <p>{DisplayPriceInRupees(totalPrice)}</p>
      </div>
    </div>
  );
});

BillDetails.displayName = 'BillDetails';

const EmptyCart = memo(({ close }) => {
  const { t } = useTranslation();

  return (
    <div className='bg-white flex flex-col justify-center items-center'>
      <Image
        src="/assets/empty_cart.avif"
        className='w-full h-full object-scale-down'
        alt={t("cartDrawer.emptyCartAlt")}
        width={250}
        height={190}
        priority={true}
      />
      <Link onClick={close} href={"/"} className='block bg-pink-400 px-4 py-2 text-white rounded mt-4'>
        {t("cartDrawer.shopNow")}
      </Link>
    </div>
  );
});

EmptyCart.displayName = 'EmptyCart';

const DisplayCartItem = ({ close }) => {
  const { t } = useTranslation();
  const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
  const cartItem = useSelector(state => state.cartItem.cart);
  const authUser = useSelector(state => state.auth?.user);
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (cartItem.length === 0) return undefined;
    let idleId;
    const run = () => {
      try {
        router.prefetch("/checkout");
      } catch {
        /* noop */
      }
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timerId = setTimeout(run, 100);
    return () => clearTimeout(timerId);
  }, [cartItem.length, router]);

  const redirectToCheckoutPage = () => {
    router.push("/checkout");
    if (close) close();
  };

  // Only compute this once per render
  const user = authUser || getStoredUser();
  const isUserAuthenticated = !!(isAuthenticated || user);
  const hasItems = cartItem.length > 0;

  return (
    <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
      <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto relative'>
        <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
          <h2 className='font-semibold'>{t("cartDrawer.cart")}</h2>
          <Link href="/" className='lg:hidden' prefetch={true}>
            <IoClose size={25} />
          </Link>
          <button onClick={close} className='hidden lg:block'>
            <IoClose size={25} />
          </button>
        </div>

        <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
          {hasItems ? (
            <>
              <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
                <p>{t("cartDrawer.totalSavings")}</p>
                <p>{DisplayPriceInRupees(notDiscountTotalPrice - totalPrice)}</p>
              </div>
              <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
                {cartItem.map((item) => (
                  <CartItem key={item?._id + "cartItemDisplay"} item={item} />
                ))}
              </div>
              <BillDetails 
                notDiscountTotalPrice={notDiscountTotalPrice} 
                totalPrice={totalPrice} 
                totalQty={totalQty} 
              />
            </>
          ) : (
            <EmptyCart close={close} />
          )}
        </div>

        {hasItems && (
          <div className='p-2'>
            <div className='bg-pink-400 text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between'>
              <div>
                {DisplayPriceInRupees(totalPrice)}
              </div>
              <button 
                onClick={redirectToCheckoutPage} 
                className='flex items-center gap-1'
              >
                {t("cartDrawer.proceed")}
                <span><FaCaretRight /></span>
              </button>
            </div>
            {!isUserAuthenticated &&
              <div className='mt-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded text-center'>
                {t("cartDrawer.guestCheckoutNote")}
              </div>
            }
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(DisplayCartItem);
