import type { IMapItem } from "@app-types/map.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ICityCoordinates {
    city_name: string;
    center: [number, number];
    zoom: number;
}

export const mapApi = createApi({
    reducerPath: "mapApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/map`,
    }),
    endpoints: (builder) => ({
        getMapNPOs: builder.query<IMapItem[], string | undefined>({
            query: (city) => {
                if (city) {
                    return {
                        url: `/npo`,
                        params: { city },
                    };
                }
                return {
                    url: `/npo`,
                };
            },
        }),
        getCityCoordinates: builder.query<Record<string, ICityCoordinates>, void>({
            query: () => `/city-coordinates`,
        }),
        getCityCoordinate: builder.query<ICityCoordinates, string>({
            query: (cityName) => `/city-coordinates/${cityName}`,
        }),
    }),
});

export const { useGetMapNPOsQuery, useGetCityCoordinatesQuery, useGetCityCoordinateQuery } = mapApi;
