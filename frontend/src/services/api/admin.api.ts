import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { INPO, NPOStatus, IAllNPOStatistics } from "@app-types/npo.types";
import { prepareHeaders } from "./utils/prepareHeaders";
import { getApiBaseUrl } from "@utils/apiUrl";

// Кастомный baseQuery, который динамически определяет baseUrl
const dynamicBaseQuery = (args: any, api: any, extraOptions: any) => {
    const baseUrl = `${getApiBaseUrl()}/admin`;
    return fetchBaseQuery({
        baseUrl,
        prepareHeaders,
    })(args, api, extraOptions);
};

export const adminApi = createApi({
    reducerPath: "adminApi",
    tagTypes: ["UnconfirmedNPO", "Event", "News", "AllNPOStatistics"],
    baseQuery: dynamicBaseQuery,
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
        getAllNPOStatistics: builder.query<IAllNPOStatistics, { startDate?: string; endDate?: string } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.startDate) searchParams.append("start_date", params.startDate);
                if (params?.endDate) searchParams.append("end_date", params.endDate);
                const queryString = searchParams.toString();
                return { url: `/statistics/all-npos${queryString ? `?${queryString}` : ""}` };
            },
            providesTags: [{ type: "AllNPOStatistics", id: "LIST" }],
        }),
    }),
});

export const {
    useGetUnconfirmedNPOsQuery,
    useUpdateNPOStatusMutation,
    useDeleteNPOMutation,
    useDeleteEventMutation,
    useGetAllNPOStatisticsQuery,
} = adminApi;
