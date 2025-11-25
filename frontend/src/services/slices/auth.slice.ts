import type { UserTypes } from "@app-types/auth.types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthState = AuthLoginState | AuthLogoutState;

interface AuthLoginState {
    token: string;
    isAuthenticated: true;
    userType: UserTypes;
    userId: number;
}

interface AuthLogoutState {
    token: null;
    isAuthenticated: false;
    userType: undefined;
    userId: undefined;
}

const initialState: AuthState = (() => {
    if (
        localStorage.getItem("jwtToken") &&
        localStorage.getItem("jwtToken") !== null &&
        localStorage.getItem("userType") &&
        localStorage.getItem("userId")
    ) {
        return {
            token: localStorage.getItem("jwtToken") as string,
            isAuthenticated: true,
            userType: localStorage.getItem("userType") as UserTypes,
            userId: Number(localStorage.getItem("userId")),
        };
    }

    return {
        token: null,
        isAuthenticated: false,
        userType: undefined,
        userId: undefined,
    };
})();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ token: string; type: UserTypes; id: number }>) => {
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.userType = action.payload.type;
            state.userId = action.payload.id;

            localStorage.setItem("jwtToken", action.payload.token);
            localStorage.setItem("userType", action.payload.type);
            localStorage.setItem("userId", String(action.payload.id));
        },
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.userType = undefined;
            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userType");
            localStorage.removeItem("userId");
            // Сбрасываем флаг загрузки города из бэкенда при выходе
            localStorage.removeItem("cityLoadedFromBackend");
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
