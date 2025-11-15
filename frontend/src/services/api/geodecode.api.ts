import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IGeodecode } from "@app-types/geodecode.types";

export const geodecodeApi = createApi({
    reducerPath: "geodecodeApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `https://nominatim.openstreetmap.org`,
    }),
    endpoints: (builder) => ({
        geodecode: builder.query<IGeodecode[], string>({
            query: (address) => ({ url: `/search?format=json&q=${encodeURIComponent(address)}` }),
        }),
    }),
});

export const { useLazyGeodecodeQuery } = geodecodeApi;
