// components/UserPage.jsx
'use client'

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Divider from './Divider';
import Axios from '@/backend/http/legacyClient';
import SummaryApi from '@/backend/contracts/summaryApi';
import { logout } from '../store/userSlice';
import toast from 'react-hot-toast';
import AxiosToastError from '@/backend/http/axiosToastError';
import { HiOutlineExternalLink } from 'react-icons/hi';
import isAdmin from '../utils/isAdmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const UserPage = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout
      });
      if (response.data.success) {
        dispatch(logout());
        localStorage.clear();
        toast.success(response.data.message || t('accountMenu.loggedOut'));
        router.push('/');
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="font-bold mb-2">{t('accountMenu.myAccount')}</div>
      <div className="text-sm flex items-center gap-2 mb-4">
        <span className="max-w-52 text-ellipsis line-clamp-1">
          {user.name || user.mobile || t('accountMenu.guest')}
          <span className="text-medium text-red-600">
            {user.role === 'ADMIN' ? ` (${t('accountMenu.admin')})` : ''}
          </span>
        </span>
        <Link href="/dashboard/profile" className="hover:text-primary-200" aria-label={t('accountMenu.openProfile')}>
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className="text-sm font-semibold sm:font-bold grid gap-1 mt-4">
        {isAdmin(user.role) && (
          <>
            <Link href="/dashboard" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.dashboardOverview')}</Link>
            <Link href="/dashboard/category" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.category')}</Link>
            <Link href="/dashboard/subcategory" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.subCategory')}</Link>
            <Link href="/dashboard/upload-product" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.uploadProduct')}</Link>
            <Link href="/dashboard/product" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.product')}</Link>
            <Link href="/dashboard/brand" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.brand')}</Link>
          </>
        )}
        <Link href="/dashboard/myorders" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.myOrders')}</Link>
        <Link href="/dashboard/address" className="px-2 hover:bg-orange-200 py-1">{t('accountMenu.saveAddress')}</Link>
        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-orange-200 py-1"
        >
          {t('accountMenu.logOut')}
        </button>
      </div>
    </div>
  );
};

export default UserPage;
