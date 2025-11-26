import type { INPO, INPOEditRequest, INPOStatistics } from "@app-types/npo.types";
import type { IEvent, EventStatus } from "@app-types/events.types";
import type { INews, INewsCreate } from "@app-types/news.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@utils/apiUrl";
import { eventsApi } from "./events.api";

export interface IEventCreateRequest {
    name: string;
    description?: string | null;
    start: string;
    end: string;
    coordinates?: [number, number] | null;
    quantity?: number | null;
    tags?: string[] | null;
    city: string;
    attachedIds?: number[] | null;
}

export interface IEventUpdateRequest {
    name?: string;
    description?: string | null;
    start?: string;
    end?: string;
    coordinates?: [number, number] | null;
    quantity?: number | null;
    tags?: string[] | null;
    city?: string;
    attachedIds?: number[] | null;
}

export interface IEventStatusUpdateRequest {
    status: EventStatus;
}

export const npoApi = createApi({
    reducerPath: "npoApi",
    tagTypes: ["NPO", "Event", "Statistics", "News"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/npo`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getNPOs: builder.query<INPO[], string | undefined>({
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
        // Event management endpoints
        getNPOEvents: builder.query<IEvent[], number>({
            query: (npoId) => ({ url: `/${npoId}/event` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Event" as const, id })),
                          { type: "Event", id: "LIST" },
                      ]
                    : [{ type: "Event", id: "LIST" }],
        }),
        createEvent: builder.mutation<IEvent, { npoId: number; body: IEventCreateRequest }>({
            query: (payload) => ({
                url: `/${payload.npoId}/event`,
                method: "POST",
                body: payload.body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Инвалидируем теги в eventsApi для обновления календаря
                    dispatch(
                        eventsApi.util.invalidateTags([
                            { type: "Event", id: data.id },
                            { type: "Event", id: "LIST" },
                        ])
                    );
                } catch {
                    // Игнорируем ошибки при инвалидации
                }
            },
            invalidatesTags: (_, __, payload) => [
                { type: "Event", id: "LIST" },
                { type: "Statistics", id: payload.npoId },
            ],
        }),
        updateEvent: builder.mutation<
            IEvent,
            { npoId: number; eventId: number; body: IEventUpdateRequest }
        >({
            query: (payload) => ({
                url: `/${payload.npoId}/event/${payload.eventId}`,
                method: "PUT",
                body: payload.body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Инвалидируем теги в eventsApi для обновления календаря
                    dispatch(
                        eventsApi.util.invalidateTags([
                            { type: "Event", id: arg.eventId },
                            { type: "Event", id: "LIST" },
                        ])
                    );
                } catch {
                    // Игнорируем ошибки при инвалидации
                }
            },
            invalidatesTags: (_, __, payload) => [
                { type: "Event", id: payload.eventId },
                { type: "Event", id: "LIST" },
                { type: "Statistics", id: payload.npoId },
            ],
        }),
        deleteEvent: builder.mutation<void, { npoId: number; eventId: number }>({
            query: (payload) => ({
                url: `/${payload.npoId}/event/${payload.eventId}`,
                method: "DELETE",
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Инвалидируем теги в eventsApi для обновления календаря
                    dispatch(
                        eventsApi.util.invalidateTags([
                            { type: "Event", id: arg.eventId },
                            { type: "Event", id: "LIST" },
                        ])
                    );
                } catch {
                    // Игнорируем ошибки при инвалидации
                }
            },
            invalidatesTags: (_, __, payload) => [
                { type: "Event", id: payload.eventId },
                { type: "Event", id: "LIST" },
                { type: "Statistics", id: payload.npoId },
            ],
        }),
        updateEventStatus: builder.mutation<
            void,
            { npoId: number; eventId: number; body: IEventStatusUpdateRequest }
        >({
            query: (payload) => ({
                url: `/${payload.npoId}/event/${payload.eventId}/status`,
                method: "PATCH",
                body: payload.body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Инвалидируем теги в eventsApi для обновления календаря
                    dispatch(
                        eventsApi.util.invalidateTags([
                            { type: "Event", id: arg.eventId },
                            { type: "Event", id: "LIST" },
                        ])
                    );
                } catch {
                    // Игнорируем ошибки при инвалидации
                }
            },
            invalidatesTags: (_, __, payload) => [
                { type: "Event", id: payload.eventId },
                { type: "Event", id: "LIST" },
                { type: "Statistics", id: payload.npoId },
            ],
        }),
        // Statistics endpoints
        registerNPOView: builder.mutation<void, number>({
            query: (npoId) => ({
                url: `/${npoId}/view`,
                method: "POST",
            }),
            invalidatesTags: (_, __, npoId) => [{ type: "Statistics", id: npoId }],
        }),
        registerEventView: builder.mutation<void, { npoId: number; eventId: number }>({
            query: (payload) => ({
                url: `/${payload.npoId}/event/${payload.eventId}/view`,
                method: "POST",
            }),
            invalidatesTags: (_, __, payload) => [{ type: "Statistics", id: payload.npoId }],
        }),
        getNPOStatistics: builder.query<INPOStatistics, number>({
            query: (npoId) => ({ url: `/${npoId}/statistics` }),
            providesTags: (_, __, npoId) => [{ type: "Statistics", id: npoId }],
        }),
        // Analytics export endpoints
        exportNPOAnalyticsCSV: builder.query<Blob, number>({
            query: (npoId) => ({
                url: `/${npoId}/analytics/export/csv`,
                responseHandler: async (response) => {
                    if (!response.ok) {
                        throw new Error("Failed to download CSV");
                    }
                    return await response.blob();
                },
            }),
        }),
        exportNPOAnalyticsPDF: builder.query<Blob, number>({
            query: (npoId) => ({
                url: `/${npoId}/analytics/export/pdf`,
                responseHandler: async (response) => {
                    if (!response.ok) {
                        throw new Error("Failed to download PDF");
                    }
                    return await response.blob();
                },
            }),
        }),
        // News endpoints
        getNPONews: builder.query<INews[], number>({
            query: (npoId) => ({ url: `/${npoId}/news` }),
            providesTags: (result, _error, npoId) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "News" as const, id })),
                          { type: "News", id: `NPO-${npoId}` },
                      ]
                    : [{ type: "News", id: `NPO-${npoId}` }],
        }),
        createNPONews: builder.mutation<INews, { npoId: number; body: INewsCreate }>({
            query: (payload) => ({
                url: `/${payload.npoId}/news`,
                method: "POST",
                body: payload.body,
            }),
            invalidatesTags: (_, __, payload) => [
                { type: "News", id: "LIST" },
                { type: "News", id: `NPO-${payload.npoId}` },
                { type: "Statistics", id: payload.npoId },
            ],
        }),
    }),
});

export const {
    useGetNPOsQuery,
    useGetNPOByIdQuery,
    useEditNPOMutation,
    useGetNPOEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useUpdateEventStatusMutation,
    useRegisterNPOViewMutation,
    useRegisterEventViewMutation,
    useGetNPOStatisticsQuery,
    useLazyExportNPOAnalyticsCSVQuery,
    useLazyExportNPOAnalyticsPDFQuery,
    useGetNPONewsQuery,
    useCreateNPONewsMutation,
} = npoApi;
