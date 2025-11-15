import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";

import { authApi } from "./api/auth.api";
import { geodecodeApi } from "./api/geodecode.api";

import loadingReducer from "./slices/loading.slice";
import cityReducer from "./slices/city.slice";
import authReducer from "./slices/auth.slice";

import loadingMiddleware from "./middlewares/loading.middleware";
import errorMiddleware from "./middlewares/error.middleware";

const rootReducer = combineReducers({
    authApi: authApi.reducer,
    geodecodeApi: geodecodeApi.reducer,
    loading: loadingReducer,
    city: cityReducer,
    auth: authReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authApi.middleware)
            .concat(geodecodeApi.middleware)
            .concat(loadingMiddleware)
            .concat(errorMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
