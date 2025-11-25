import type { INews, INewsCreate, INewsUpdate } from "@app-types/news.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@utils/apiUrl";

export const newsApi = createApi({
    reducerPath: "newsApi",
    tagTypes: ["News"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/news`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getNewsTypes: builder.query<string[], void>({
            query: () => ({ url: `/types` }),
        }),
        getNews: builder.query<INews[], string | undefined>({
            query: (city) => {
                const params = city ? { city } : {};
                return {
                    url: ``,
                    ...(city && { params }),
                };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "News" as const, id })),
                          { type: "News", id: "LIST" },
                      ]
                    : [{ type: "News", id: "LIST" }],
        }),
        getNewsById: builder.query<INews, number>({
            query: (id) => ({ url: `/${id}` }),
            providesTags: (_result, _error, id) => [{ type: "News", id }],
        }),
        createNews: builder.mutation<INews, INewsCreate>({
            query: (body) => ({ url: ``, method: "POST", body }),
            invalidatesTags: [{ type: "News", id: "LIST" }],
        }),
        updateNews: builder.mutation<INews, { id: number; body: INewsUpdate }>({
            query: (payload) => ({
                url: `/${payload.id}`,
                method: "PUT",
                body: payload.body,
            }),
            invalidatesTags: (_result, _error, payload) => [
                { type: "News", id: payload.id },
                { type: "News", id: "LIST" },
            ],
        }),
        deleteNews: builder.mutation<void, number>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: (_result, _error, id) => [
                { type: "News", id },
                { type: "News", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetNewsTypesQuery,
    useGetNewsQuery,
    useGetNewsByIdQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;
