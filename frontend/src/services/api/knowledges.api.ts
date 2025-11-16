import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IKnowledge } from "@app-types/knowledges.types";

export const knowledgesApi = createApi({
    reducerPath: "knowledgesApi",
    tagTypes: ["Knowledge"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/knowledges`,
    }),
    endpoints: (builder) => ({
        getKnowledges: builder.query<IKnowledge[], void>({
            query: () => ({ url: `/` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Knowledge" as const, id })),
                          { type: "Knowledge", id: "LIST" },
                      ]
                    : [{ type: "Knowledge", id: "LIST" }],
        }),
        getKnowledgeById: builder.query<IKnowledge, number>({
            query: (id) => ({ url: `/${id}` }),
            providesTags: (_, __, id) => [{ type: "Knowledge", id }],
        }),
    }),
});

export const { useGetKnowledgesQuery, useGetKnowledgeByIdQuery } = knowledgesApi;
