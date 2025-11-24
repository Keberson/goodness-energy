import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { IFileInfo } from "@app-types/files.types";
import { getApiBaseUrl } from "@utils/apiUrl";

export const filesApi = createApi({
    reducerPath: "filesApi",
    tagTypes: [],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/files`,
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
