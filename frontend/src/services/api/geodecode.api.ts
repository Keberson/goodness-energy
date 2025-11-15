import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IGeodecode } from "@app-types/geodecode.types";

export const geodecodeApi = createApi({
    reducerPath: "geodecodeApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/auth`,
    }),
    endpoints: (builder) => ({
        geodecode: builder.query<IGeodecode[], string>({
            query: (address) => ({ url: `/search?format=json&q=${encodeURIComponent(address)}` }),
        }),
    }),
});

export const { useLazyGeodecodeQuery } = geodecodeApi;
