import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    ILoginRequest,
    IAuthResponse,
    IRegVolunteerRequest,
    IRegNPORequest,
    INotificationSettings,
    INotificationSettingsUpdate,
} from "@app-types/auth.types";
import { getApiBaseUrl } from "@utils/apiUrl";

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/auth`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginRequest>({
            query: (body) => ({ url: `/login`, method: "POST", body }),
        }),
        registerVolunteer: builder.mutation<IAuthResponse, IRegVolunteerRequest>({
            query: (body) => ({ url: `/reg/vol`, method: "POST", body }),
        }),
        registerNPO: builder.mutation<IAuthResponse, IRegNPORequest>({
            query: (body) => ({ url: `/reg/npo`, method: "POST", body }),
        }),
        getSelectedCity: builder.query<{ selected_city: string | null }, void>({
            query: () => ({ url: `/selected-city` }),
        }),
        updateSelectedCity: builder.mutation<{ message: string; selected_city: string }, { city: string }>({
            query: (body) => ({
                url: `/selected-city`,
                method: "PUT",
                body,
            }),
        }),
        getNotificationSettings: builder.query<INotificationSettings, void>({
            query: () => ({ url: `/notification-settings` }),
        }),
        updateNotificationSettings: builder.mutation<INotificationSettings, INotificationSettingsUpdate>({
            query: (body) => ({
                url: `/notification-settings`,
                method: "PUT",
                body,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterVolunteerMutation,
    useRegisterNPOMutation,
    useGetSelectedCityQuery,
    useUpdateSelectedCityMutation,
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
} = authApi;
