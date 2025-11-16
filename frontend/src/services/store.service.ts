import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";

import { authApi } from "./api/auth.api";
import { geodecodeApi } from "./api/geodecode.api";
import { mapApi } from "./api/map.api";
import { npoApi } from "./api/npo.api";
import { volunteerApi } from "./api/volunteer.api";
import { newsApi } from "./api/news.api";
import { knowledgesApi } from "./api/knowledges.api";
import { filesApi } from "./api/files.api";
import { eventsApi } from "./api/events.api";
import { adminApi } from "./api/admin.api";

import loadingReducer from "./slices/loading.slice";
import cityReducer from "./slices/city.slice";
import authReducer from "./slices/auth.slice";

import loadingMiddleware from "./middlewares/loading.middleware";
import errorMiddleware from "./middlewares/error.middleware";

const rootReducer = combineReducers({
    authApi: authApi.reducer,
    geodecodeApi: geodecodeApi.reducer,
    mapApi: mapApi.reducer,
    npoApi: npoApi.reducer,
    volunteerApi: volunteerApi.reducer,
    newsApi: newsApi.reducer,
    knowledgesApi: knowledgesApi.reducer,
    filesApi: filesApi.reducer,
    eventsApi: eventsApi.reducer,
    adminApi: adminApi.reducer,
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
            .concat(mapApi.middleware)
            .concat(npoApi.middleware)
            .concat(volunteerApi.middleware)
            .concat(newsApi.middleware)
            .concat(knowledgesApi.middleware)
            .concat(filesApi.middleware)
            .concat(eventsApi.middleware)
            .concat(adminApi.middleware)
            .concat(loadingMiddleware)
            .concat(errorMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
