import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IKnowledge } from "@app-types/knowledges.types";
import { getApiBaseUrl } from "@utils/apiUrl";

export const knowledgesApi = createApi({
    reducerPath: "knowledgesApi",
    tagTypes: ["Knowledge"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/knowledges`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
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
        createKnowledge: builder.mutation<
            IKnowledge,
            {
                name: string;
                text: string;
                attachedIds?: number[];
                tags?: string[];
                links?: string[];
            }
        >({
            query: (body) => ({
                url: "",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "Knowledge", id: "LIST" }],
        }),
        updateKnowledge: builder.mutation<
            IKnowledge,
            {
                id: number;
                name?: string;
                text?: string;
                attachedIds?: number[];
                tags?: string[];
                links?: string[];
            }
        >({
            query: ({ id, ...body }) => ({
                url: `/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Knowledge", id },
                { type: "Knowledge", id: "LIST" },
            ],
        }),
        deleteKnowledge: builder.mutation<void, number>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, id) => [
                { type: "Knowledge", id },
                { type: "Knowledge", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetKnowledgesQuery,
    useGetKnowledgeByIdQuery,
    useCreateKnowledgeMutation,
    useUpdateKnowledgeMutation,
    useDeleteKnowledgeMutation,
} = knowledgesApi;
