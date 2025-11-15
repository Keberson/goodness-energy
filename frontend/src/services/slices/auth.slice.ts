import type { UserTypes } from "@app-types/auth.types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    userType: UserTypes | undefined;
}

const initialState: AuthState = {
    token: localStorage.getItem("jwtToken"),
    isAuthenticated: !!localStorage.getItem("jwtToken"),
    userType: localStorage.getItem("userType")
        ? (localStorage.getItem("userType") as UserTypes)
        : undefined,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ token: string; type: UserTypes }>) => {
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.userType = action.payload.type;
            localStorage.setItem("jwtToken", action.payload.token);
            localStorage.setItem("userType", action.payload.type);
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.userType = undefined;
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userType");
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
