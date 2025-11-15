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
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth`,
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
    }),
});

export const { useLoginMutation, useRegisterVolunteerMutation, useRegisterNPOMutation } = authApi;
