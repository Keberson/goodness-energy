import type { IMapItem } from "@app-types/map.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const mapApi = createApi({
    reducerPath: "mapApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/map`,
    }),
    endpoints: (builder) => ({
        getMapNPOs: builder.query<IMapItem[], void>({
            query: () => ({ url: `/npo` }),
        }),
    }),
});

export const { useGetMapNPOsQuery } = mapApi;
