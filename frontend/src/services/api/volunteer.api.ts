import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IVolunteer, IVolunteerEdit } from "@app-types/volunteer.types";

import { prepareHeaders } from "./utils/prepareHeaders";

export const volunteerApi = createApi({
    reducerPath: "volunteerApi",
    tagTypes: ["Volunteer"],
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
    }),
});

export const { useGetVolunteersQuery, useGetVolunteerByIdQuery, useEditVolunteerMutation } =
    volunteerApi;
