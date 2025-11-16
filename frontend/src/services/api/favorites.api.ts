import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IFavorite, IFavoriteCreate, IFavoriteItem, IFavoriteCheck, FavoriteType } from "@app-types/favorites.types";

import { prepareHeaders } from "./utils/prepareHeaders";

export const favoritesApi = createApi({
    reducerPath: "favoritesApi",
    tagTypes: ["Favorite"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/favorites`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getFavorites: builder.query<IFavoriteItem[], void>({
            query: () => ({ url: `` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ favorite_id }) => ({ type: "Favorite" as const, id: favorite_id })),
                          { type: "Favorite", id: "LIST" },
                      ]
                    : [{ type: "Favorite", id: "LIST" }],
        }),
        addFavorite: builder.mutation<IFavorite, IFavoriteCreate>({
            query: (body) => ({
                url: ``,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { item_type, item_id }) => [
                { type: "Favorite", id: "LIST" },
                { type: "Favorite", id: `${item_type}-${item_id}` },
            ],
        }),
        removeFavorite: builder.mutation<void, { item_type: FavoriteType; item_id: number }>({
            query: ({ item_type, item_id }) => ({
                url: `/${item_type}/${item_id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { item_type, item_id }) => [
                { type: "Favorite", id: "LIST" },
                { type: "Favorite", id: `${item_type}-${item_id}` },
            ],
        }),
        checkFavorite: builder.query<IFavoriteCheck, { item_type: FavoriteType; item_id: number }>({
            query: ({ item_type, item_id }) => ({ url: `/check/${item_type}/${item_id}` }),
            providesTags: (_result, _error, { item_type, item_id }) => [
                { type: "Favorite", id: `${item_type}-${item_id}` },
            ],
        }),
    }),
});

export const {
    useGetFavoritesQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
    useCheckFavoriteQuery,
} = favoritesApi;

