import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IGeodecode } from "@app-types/geodecode.types";

export const geodecodeApi = createApi({
    reducerPath: "geodecodeApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `https://geocode-maps.yandex.ru/1.x`,
    }),
    endpoints: (builder) => ({
        geodecode: builder.query<IGeodecode, string>({
            query: (address) => ({
                url: `/?apikey=7d835504-479d-4bce-b1f2-8e30c96660e7&geocode=${encodeURIComponent(
                    address
                )}&format=json`,
            }),
        }),
    }),
});

export const { useLazyGeodecodeQuery } = geodecodeApi;
