import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IFileInfo } from "@app-types/files.types";

export const filesApi = createApi({
    reducerPath: "filesApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_BASE_URL}/files`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getFileInfo: builder.query<IFileInfo, number>({
            query: (id) => ({ url: `/${id}/info` }),
        }),
        uploadFile: builder.mutation<IFileInfo, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append("file", file);
                return {
                    url: "",
                    method: "POST",
                    body: formData,
                };
            },
        }),
    }),
});

export const { useGetFileInfoQuery, useUploadFileMutation } = filesApi;
