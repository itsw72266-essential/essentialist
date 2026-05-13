'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import fetchUserDetails from '../utils/fetchUserDetails';
import { setUserDetails } from '../store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from '../store/productSlice';
import Axios from '@/backend/http/legacyClient';
import SummaryApi from '@/backend/contracts/summaryApi';
import {
  readPersistedUser,
  hasAuthTokens,
  clearPersistedUser,
} from '../utils/authUserStorage';

export default function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    (async () => {
      dispatch(setLoadingCategory(true));

      if (typeof window !== 'undefined') {
        const persisted = readPersistedUser();
        if (persisted && hasAuthTokens()) {
          dispatch(setUserDetails(persisted));
        } else if (persisted && !hasAuthTokens()) {
          clearPersistedUser();
        }
      }

      const [userResult, catResult, subCatResult] = await Promise.allSettled([
        fetchUserDetails(),
        Axios(SummaryApi.getCategory),
        Axios(SummaryApi.getSubCategory),
      ]);

      if (!isMounted) return;

      if (userResult.status === 'fulfilled' && userResult.value?.data) {
        dispatch(setUserDetails(userResult.value.data));
      }

      if (catResult.status === 'fulfilled' && catResult.value?.data?.success) {
        dispatch(
          setAllCategory(
            catResult.value.data.data.sort((a, b) => a.name.localeCompare(b.name))
          )
        );
      }

      if (subCatResult.status === 'fulfilled' && subCatResult.value?.data?.success) {
        dispatch(
          setAllSubCategory(
            subCatResult.value.data.data.sort((a, b) => a.name.localeCompare(b.name))
          )
        );
      }

      if (isMounted) dispatch(setLoadingCategory(false));
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}
