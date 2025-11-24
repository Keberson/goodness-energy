import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IEvent } from "@app-types/events.types";
import { getApiBaseUrl } from "@utils/apiUrl";

export const eventsApi = createApi({
    reducerPath: "eventsApi",
    tagTypes: ["Event"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/events`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getEvents: builder.query<IEvent[], string | undefined>({
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
                          ...result.map(({ id }) => ({ type: "Event" as const, id })),
                          { type: "Event", id: "LIST" },
                      ]
                    : [{ type: "Event", id: "LIST" }],
        }),
    }),
});

export const { useGetEventsQuery } = eventsApi;

