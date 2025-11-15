import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: localStorage.getItem("jwtToken"),
    isAuthenticated: !!localStorage.getItem("jwtToken"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem("jwtToken", action.payload);
        },
        clearToken: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("jwtToken");
        },
    },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
