import type { IMapItem } from "@app-types/map.types";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@utils/apiUrl";

export interface ICityCoordinates {
    city_name: string;
    center: [number, number];
    zoom: number;
}

export const mapApi = createApi({
    reducerPath: "mapApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/map`,
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
        getCities: builder.query<string[], void>({
            query: () => `/cities`,
        }),
    }),
});

export const { useGetMapNPOsQuery, useGetCityCoordinatesQuery, useGetCityCoordinateQuery, useGetCitiesQuery } = mapApi;
