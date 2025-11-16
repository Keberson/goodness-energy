import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IFileInfo } from "@app-types/files.types";

export const filesApi = createApi({
    reducerPath: "filesApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/files`,
    }),
    endpoints: (builder) => ({
        getFileInfo: builder.query<IFileInfo, number>({
            query: (id) => ({ url: `/${id}/info` }),
        }),
    }),
});

export const { useGetFileInfoQuery } = filesApi;
