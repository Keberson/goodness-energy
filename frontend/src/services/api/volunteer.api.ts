import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IVolunteer, IVolunteerEdit } from "@app-types/volunteer.types";
import type { IEvent } from "@app-types/events.types";

import { prepareHeaders } from "./utils/prepareHeaders";

export const volunteerApi = createApi({
    reducerPath: "volunteerApi",
    tagTypes: ["Volunteer", "Event"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/volunteer`,
        prepareHeaders,
    }),
    endpoints: (builder) => ({
        getVolunteers: builder.query<IVolunteer[], void>({
            query: () => ({ url: `` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Volunteer" as const, id })),
                          { type: "Volunteer", id: "LIST" },
                      ]
                    : [{ type: "Volunteer", id: "LIST" }],
        }),
        getVolunteerById: builder.query<IVolunteer, number>({
            query: (id) => ({ url: `/${id}` }),
            providesTags: (_result, _error, id) => [{ type: "Volunteer", id }],
        }),
        editVolunteer: builder.mutation<void, { id: number; body: IVolunteerEdit }>({
            query: (payload) => ({
                url: `/${payload.id}`,
                method: "PUT",
                body: payload.body,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                },
            }),
            invalidatesTags: (_, __, payload) => [{ type: "Volunteer", id: payload.id }],
        }),
        getVolunteerEvents: builder.query<IEvent[], number>({
            query: (volunteerId) => ({ url: `/${volunteerId}/event` }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: "Event" as const, id })),
                          { type: "Event", id: "VOLUNTEER_LIST" },
                      ]
                    : [{ type: "Event", id: "VOLUNTEER_LIST" }],
        }),
        respondToEvent: builder.mutation<void, number>({
            query: (eventId) => ({
                url: `/event/${eventId}`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "Event", id: "VOLUNTEER_LIST" }],
        }),
        deleteEventResponse: builder.mutation<void, number>({
            query: (eventId) => ({
                url: `/event/${eventId}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Event", id: "VOLUNTEER_LIST" }],
        }),
    }),
});

export const {
    useGetVolunteersQuery,
    useGetVolunteerByIdQuery,
    useEditVolunteerMutation,
    useGetVolunteerEventsQuery,
    useRespondToEventMutation,
    useDeleteEventResponseMutation,
} = volunteerApi;
