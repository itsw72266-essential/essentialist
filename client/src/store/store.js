// client/src/store/store.js
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import userReducer, { setUserDetails, logout, updatedAvatar } from './userSlice';
import productReducer from './productSlice';
import cartReducer from './cartProduct';
import addressReducer from './addressSlice';
import orderReducer from './orderSlice';
import { writePersistedUser, clearPersistedUser } from '@/utils/authUserStorage';

const userPersistListener = createListenerMiddleware();

userPersistListener.startListening({
  actionCreator: setUserDetails,
  effect: (action) => {
    if (typeof window === 'undefined') return;
    const p = action.payload;
    if (p && typeof p === 'object' && p._id) {
      writePersistedUser(p);
    }
  },
});

userPersistListener.startListening({
  actionCreator: logout,
  effect: () => {
    if (typeof window === 'undefined') return;
    clearPersistedUser();
  },
});

userPersistListener.startListening({
  actionCreator: updatedAvatar,
  effect: (action, { getState }) => {
    if (typeof window === 'undefined') return;
    const u = getState().user;
    if (u?._id) {
      writePersistedUser({ ...u, avatar: action.payload ?? u.avatar });
    }
  },
});

export const store = configureStore({
  reducer: {
    user: userReducer,
    product: productReducer,
    cartItem: cartReducer,
    addresses: addressReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(userPersistListener.middleware),
});