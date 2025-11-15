import type { INPO } from "@app-types/npo.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const npoApi = createApi({
    reducerPath: "npoApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/npo`,
    }),
    endpoints: (builder) => ({
        getNPOs: builder.query<INPO[], void>({
            query: () => ({ url: `` }),
        }),
    }),
});

export const { useGetNPOsQuery } = npoApi;
