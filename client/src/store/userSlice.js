// client/src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    _id: "",
    name: "",
    email: "",
    avatar: "",
    mobile: "",
    role: "",
}

const userSlice = createSlice({
    name: 'user',
    initialState: initialValue,
    reducers: {
        setUserDetails: (state, action) => {
            const p = action.payload;
            // Never wipe the session from null/empty/malformed payloads — use `logout` to sign out.
            if (!p || typeof p !== 'object' || !p._id) {
                return;
            }
            state._id = p._id;
            state.name = p.name ?? '';
            state.email = p.email ?? '';
            state.avatar = p.avatar ?? '';
            state.mobile = p.mobile ?? '';
            state.role = p.role ?? '';
        },
        updatedAvatar: (state, action) => {
            state.avatar = action.payload;
        },
        logout: (state, action) => {
            state._id = "";
            state.name = "";
            state.email = "";
            state.avatar = "";
            state.mobile = "";
            state.role = "";
        },
    }
})

export const { setUserDetails, logout, updatedAvatar } = userSlice.actions;
export default userSlice.reducer;