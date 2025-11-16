import type { INPO, INPOEditRequest, INPOStatistics } from "@app-types/npo.types";
import type { IEvent, EventStatus } from "@app-types/events.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IEventCreateRequest {
    name: string;
    description?: string | null;
    start: string;
    end: string;
    coordinates?: [number, number] | null;
    quantity?: number | null;
    tags?: string[] | null;
    city: string; // Обязательное поле - город проведения события
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
}

export interface IEventStatusUpdateRequest {
    status: EventStatus;
}

export const npoApi = createApi({
    reducerPath: "npoApi",
    tagTypes: ["NPO", "Event", "Statistics"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/npo`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
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
            invalidatesTags: (_, __, npoId) => [
                { type: "Statistics", id: npoId },
            ],
        }),
        registerEventView: builder.mutation<void, { npoId: number; eventId: number }>({
            query: (payload) => ({
                url: `/${payload.npoId}/event/${payload.eventId}/view`,
                method: "POST",
            }),
            invalidatesTags: (_, __, payload) => [
                { type: "Statistics", id: payload.npoId },
            ],
        }),
        getNPOStatistics: builder.query<INPOStatistics, number>({
            query: (npoId) => ({ url: `/${npoId}/statistics` }),
            providesTags: (_, __, npoId) => [
                { type: "Statistics", id: npoId },
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
} = npoApi;
