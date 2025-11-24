import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { INPO, NPOStatus } from "@app-types/npo.types";
import { prepareHeaders } from "./utils/prepareHeaders";
import { getApiBaseUrl } from "@utils/apiUrl";

export const adminApi = createApi({
    reducerPath: "adminApi",
    tagTypes: ["UnconfirmedNPO", "Event", "News"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/admin`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getUnconfirmedNPOs: builder.query<INPO[], void>({
            query: () => ({ url: `/npo/unconfirmed` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "UnconfirmedNPO" as const, id })),
                          { type: "UnconfirmedNPO", id: "LIST" },
                      ]
                    : [{ type: "UnconfirmedNPO", id: "LIST" }],
        }),
        updateNPOStatus: builder.mutation<
            { message: string; npo_id: number; status: string },
            { npoId: number; status: NPOStatus }
        >({
            query: ({ npoId, status }) => ({
                url: `/npo/${npoId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { npoId }) => [
                { type: "UnconfirmedNPO", id: npoId },
                { type: "UnconfirmedNPO", id: "LIST" },
            ],
        }),
        deleteNPO: builder.mutation<{ message: string }, number>({
            query: (npoId) => ({
                url: `/npo/${npoId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, npoId) => [
                { type: "UnconfirmedNPO", id: npoId },
                { type: "UnconfirmedNPO", id: "LIST" },
            ],
        }),
        deleteEvent: builder.mutation<{ message: string }, number>({
            query: (eventId) => ({
                url: `/event/${eventId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, eventId) => [
                { type: "Event", id: eventId },
                { type: "Event", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useGetUnconfirmedNPOsQuery,
    useUpdateNPOStatusMutation,
    useDeleteNPOMutation,
    useDeleteEventMutation,
} = adminApi;
