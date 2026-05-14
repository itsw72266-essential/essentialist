// 'use client';

// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';
// import { HiOutlineExternalLink } from 'react-icons/hi';

// import Divider from './Divider';
// import Axios from '../utils/Axios';
// import SummaryApi from '../common/SummaryApi';
// import AxiosToastError from '../utils/AxiosToastError';
// import isAdmin from '../utils/isAdmin';
// import { logout } from '../store/userSlice';

// const UserMenu = ({ onSelect }) => {
//   const user = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const isUserAdmin = isAdmin(user?.role);
//   const userLabel = user?.name || user?.mobile || 'Guest';

//   const closeMenu = () => {
//     if (typeof onSelect === 'function') onSelect();
//   };

//   const handleLogout = async () => {
//     try {
//       const response = await Axios({
//         ...SummaryApi.logout
//       });

//       if (response?.data?.success) {
//         if (typeof window !== 'undefined') {
//           localStorage.clear();
//         }
//         dispatch(logout());
//         toast.success(response.data.message || 'Logged out');
//         closeMenu();
//         router.push('/');
//       } else {
//         toast.error(response?.data?.message || 'Logout failed');
//       }
//     } catch (error) {
//       AxiosToastError(error);
//     }
//   };

//   return (
//     <nav className="text-sm">
//       <header className="mb-3">
//         <div className="font-semibold">My Account</div>
//         <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
//           <span className="max-w-[12rem] truncate">
//             {userLabel}{' '}
//             {isUserAdmin && <span className="text-red-500 font-medium">(Admin)</span>}
//           </span>
//           <Link prefetch
//             href="/dashboard/profile"
//             onClick={closeMenu}
//             className="text-primary-200 hover:text-primary-300"
//             aria-label="Open profile"
//           >
//             <HiOutlineExternalLink size={16} />
//           </Link>
//         </div>
//       </header>

//       <Divider />

//       <ul className="mt-3 grid gap-1 font-semibold">
//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Dashboard Overview
//             </Link>
//           </li>
//         )}

//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard/category"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Category
//             </Link>
//           </li>
//         )}

//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard/subcategory"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Sub Category
//             </Link>
//           </li>
//         )}

//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard/upload-product"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Upload Product
//             </Link>
//           </li>
//         )}

//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard/product"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Product
//             </Link>
//           </li>
//         )}

//         {isUserAdmin && (
//           <li>
//             <Link prefetch
//               href="/dashboard/brands"
//               onClick={closeMenu}
//               className="block rounded px-2 py-1 hover:bg-orange-200/60"
//             >
//               Brands
//             </Link>
//           </li>
//         )}

//         <li>
//           <Link prefetch
//             href="/dashboard/myorders"
//             onClick={closeMenu}
//             className="block rounded px-2 py-1 hover:bg-orange-200/60"
//           >
//             My Orders
//           </Link>
//         </li>

//         <li>
//           <Link prefetch
//             href="/dashboard/address"
//             onClick={closeMenu}
//             className="block rounded px-2 py-1 hover:bg-orange-200/60"
//           >
//             Save Address
//           </Link>
//         </li>

//         <li>
//           <button
//             type="button"
//             onClick={handleLogout}
//             className="w-full text-left rounded px-2 py-1 hover:bg-orange-200/60"
//           >
//             Log Out
//           </button>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default UserMenu;








'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Layers,
  ListTree,
  Upload,
  Package,
  Tag,
  FileText,
  Star,
  ShoppingBag,
  MapPinned,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Divider from './Divider';
import Axios from '@/lib/apiClient';
import SummaryApi from '@/backend/contracts/summaryApi';
import AxiosToastError from '@/backend/http/axiosToastError';
import isAdmin from '../utils/isAdmin';
import { logout } from '../store/userSlice';
import { cn } from '@/lib/utils';
import '@/lib/i18n';

function isNavActive(pathname, href) {
  if (!pathname || !href) return false;
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active) =>
  cn(
    'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
    active
      ? 'bg-pink-100 text-pink-900 font-semibold shadow-sm'
      : 'text-slate-700 hover:bg-pink-50/90 hover:text-pink-900',
  );

const ADMIN_NAV = [
  { href: '/dashboard', tKey: 'dashboardOverview', Icon: LayoutDashboard },
  { href: '/dashboard/category', tKey: 'category', Icon: Layers },
  { href: '/dashboard/subcategory', tKey: 'subCategory', Icon: ListTree },
  { href: '/dashboard/upload-product', tKey: 'uploadProduct', Icon: Upload },
  { href: '/dashboard/product', tKey: 'product', Icon: Package },
  { href: '/dashboard/brands', tKey: 'brands', Icon: Tag },
  { href: '/dashboard/blog', tKey: 'blogManager', Icon: FileText },
  { href: '/dashboard/reviews', tKey: 'reviewManager', Icon: Star },
];

const UserMenu = ({ onSelect }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const isUserAdmin = isAdmin(user?.role);
  const userLabel = user?.name || user?.mobile || t('accountMenu.guest');

  const closeMenu = () => {
    if (typeof onSelect === 'function') onSelect();
  };

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout
      });

      if (response?.data?.success) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        dispatch(logout());
        toast.success(response.data.message || t('accountMenu.loggedOut'));
        closeMenu();
        router.push('/');
      } else {
        toast.error(response?.data?.message || t('accountMenu.logoutFailed'));
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <nav className="text-sm">
      <header className="mb-3">
        <div className="font-semibold text-slate-800">{t('accountMenu.myAccount')}</div>
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-600">
          <span className="max-w-[10rem] truncate">
            {userLabel}{' '}
            {isUserAdmin && <span className="text-red-500 font-medium">({t('accountMenu.admin')})</span>}
          </span>
          <Link
            prefetch
            href="/dashboard/profile"
            onClick={closeMenu}
            className={cn(
              'inline-flex items-center gap-1 rounded-md p-1.5 text-pink-600 hover:bg-pink-50 hover:text-pink-800',
              isNavActive(pathname, '/dashboard/profile') && 'bg-pink-100',
            )}
            aria-label={t('accountMenu.openProfile')}
          >
            <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </header>

      <Divider />

      <ul className="mt-3 flex flex-col gap-0.5">
        {isUserAdmin &&
          ADMIN_NAV.map(({ href, tKey, Icon }) => (
            <li key={href}>
              <Link
                prefetch
                href={href}
                onClick={closeMenu}
                className={linkClass(isNavActive(pathname, href))}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span>{t(`accountMenu.${tKey}`)}</span>
              </Link>
            </li>
          ))}

        <li>
          <Link
            prefetch
            href="/dashboard/myorders"
            onClick={closeMenu}
            className={linkClass(isNavActive(pathname, '/dashboard/myorders'))}
          >
            <ShoppingBag className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span>{t('accountMenu.myOrders')}</span>
          </Link>
        </li>

        <li>
          <Link
            prefetch
            href="/dashboard/address"
            onClick={closeMenu}
            className={linkClass(isNavActive(pathname, '/dashboard/address'))}
          >
            <MapPinned className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span>{t('accountMenu.saveAddress')}</span>
          </Link>
        </li>

        <li>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              linkClass(false),
              'w-full border-0 bg-transparent cursor-pointer text-left font-medium',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            <span>{t('accountMenu.logOut')}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default UserMenu;
