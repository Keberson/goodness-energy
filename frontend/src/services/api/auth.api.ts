import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    ILoginRequest,
    IAuthResponse,
    IRegVolunteerRequest,
    IRegNPORequest,
} from "@app-types/auth.types";

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/auth`,
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
        vkidLogin: builder.mutation<IAuthResponse, { token: string; user_type: "volunteer" | "npo" }>({
            query: (body) => ({ url: `/vkid/login`, method: "POST", body }),
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
    }),
});

export const {
    useLoginMutation,
    useRegisterVolunteerMutation,
    useRegisterNPOMutation,
    useVkidLoginMutation,
    useGetSelectedCityQuery,
    useUpdateSelectedCityMutation,
} = authApi;
