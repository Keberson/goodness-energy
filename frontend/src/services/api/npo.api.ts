import type { INPO, INPOEditRequest } from "@app-types/npo.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const npoApi = createApi({
    reducerPath: "npoApi",
    tagTypes: ["NPO"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/npo`,
    }),
    endpoints: (builder) => ({
        getNPOs: builder.query<INPO[], void>({
            query: () => ({ url: `` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "NPO" as const, id })),
                          { type: "NPO", id: "LIST" },
                      ]
                    : [{ type: "NPO", id: "LIST" }],
        }),
        getNPOById: builder.query<INPO, number>({
            query: (id) => ({ url: `/${id}` }),
            providesTags: (_result, _error, id) => [{ type: "NPO", id }],
        }),
        editNPO: builder.mutation<void, { id: number; body: INPOEditRequest }>({
            query: (payload) => ({ url: `/${payload.id}`, method: "PUT", body: payload.body }),
            invalidatesTags: (_, __, payload) => [{ type: "NPO", id: payload.id }],
        }),
    }),
});

export const { useGetNPOsQuery, useGetNPOByIdQuery, useEditNPOMutation } = npoApi;
