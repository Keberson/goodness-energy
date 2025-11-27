import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "@utils/apiUrl";
import type { 
    IVolunteerPost, 
    IVolunteerPostCreate, 
    IVolunteerPostUpdate,
    IVolunteerPostModeration 
} from "@app-types/volunteer-posts.types";

export const volunteerPostsApi = createApi({
    reducerPath: "volunteerPostsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/volunteer-posts`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["VolunteerPost"],
    endpoints: (builder) => ({
        getVolunteerPosts: builder.query<IVolunteerPost[], { city?: string; status?: string; theme_tag?: string } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.city) {
                    searchParams.append("city", params.city);
                }
                if (params?.status) {
                    searchParams.append("status_filter", params.status);
                }
                if (params?.theme_tag) {
                    searchParams.append("theme_tag", params.theme_tag);
                }
                const queryString = searchParams.toString();
                return {
                    url: `${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: ["VolunteerPost"],
        }),
        getMyPosts: builder.query<IVolunteerPost[], void>({
            query: () => ({
                url: "/my",
                method: "GET",
            }),
            providesTags: ["VolunteerPost"],
        }),
        getPendingPosts: builder.query<IVolunteerPost[], void>({
            query: () => ({
                url: "/pending",
                method: "GET",
            }),
            providesTags: ["VolunteerPost"],
        }),
        getPostById: builder.query<IVolunteerPost, number>({
            query: (id) => ({
                url: `/${id}`,
                method: "GET",
            }),
            providesTags: ["VolunteerPost"],
        }),
        getAvailableThemes: builder.query<string[], void>({
            query: () => ({
                url: "/themes",
                method: "GET",
            }),
        }),
        createPost: builder.mutation<IVolunteerPost, IVolunteerPostCreate>({
            query: (data) => ({
                url: "",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["VolunteerPost"],
        }),
        updatePost: builder.mutation<IVolunteerPost, { id: number; data: IVolunteerPostUpdate }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["VolunteerPost"],
        }),
        moderatePost: builder.mutation<IVolunteerPost, { id: number; data: IVolunteerPostModeration }>({
            query: ({ id, data }) => ({
                url: `/${id}/moderate`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["VolunteerPost"],
        }),
        deletePost: builder.mutation<void, number>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["VolunteerPost"],
        }),
    }),
});

export const {
    useGetVolunteerPostsQuery,
    useGetMyPostsQuery,
    useGetPendingPostsQuery,
    useGetPostByIdQuery,
    useGetAvailableThemesQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useModeratePostMutation,
    useDeletePostMutation,
} = volunteerPostsApi;

