import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
    ILoginRequest,
    IAuthResponse,
    IRegVolunteerRequest,
    IRegNPORequest,
    INotificationSettings,
    INotificationSettingsUpdate,
} from "@app-types/auth.types";
import { getApiBaseUrl } from "@utils/apiUrl";

export const authApi = createApi({
    reducerPath: "authApi",
    tagTypes: ["NotificationSettings"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/auth`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginRequest>({
            query: (body) => ({ url: `/login`, method: "POST", body }),
        }),
        registerVolunteer: builder.mutation<IAuthResponse, IRegVolunteerRequest>({
            query: (body) => ({ url: `/reg/vol`, method: "POST", body }),
        }),
        registerNPO: builder.mutation<IAuthResponse, IRegNPORequest>({
            query: (body) => ({ url: `/reg/npo`, method: "POST", body }),
        }),
        getSelectedCity: builder.query<{ selected_city: string | null }, void>({
            query: () => ({ url: `/selected-city` }),
            // Игнорируем ошибки 401 (неавторизован), так как запрос не должен выполняться для неавторизованных
            // Это обрабатывается через skip в useCity
        }),
        updateSelectedCity: builder.mutation<{ selected_city: string }, { city: string }>({
            query: (body) => ({
                url: `/selected-city`,
                method: "PUT",
                body,
            }),
        }),
        getNotificationSettings: builder.query<INotificationSettings, void>({
            query: () => ({ url: `/notification-settings` }),
            providesTags: [{ type: "NotificationSettings", id: "current" }],
        }),
        updateNotificationSettings: builder.mutation<INotificationSettings, INotificationSettingsUpdate>({
            query: (body) => ({
                url: `/notification-settings`,
                method: "PUT",
                body,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                // Оптимистичное обновление: сразу обновляем кэш
                const patchResult = dispatch(
                    authApi.util.updateQueryData("getNotificationSettings", undefined, (draft) => {
                        if (arg.notify_city_news !== undefined) {
                            draft.notify_city_news = arg.notify_city_news;
                        }
                        if (arg.notify_registrations !== undefined) {
                            draft.notify_registrations = arg.notify_registrations;
                        }
                        if (arg.notify_events !== undefined) {
                            draft.notify_events = arg.notify_events;
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    // В случае ошибки откатываем изменения
                    patchResult.undo();
                }
            },
            invalidatesTags: [{ type: "NotificationSettings", id: "current" }],
        }),
        vkAuth: builder.mutation<IAuthResponse, { code: string; redirect_uri?: string }>({
            query: (body) => ({
                url: `/vk/auth`,
                method: "POST",
                body,
            }),
        }),
        vkIdAuth: builder.mutation<IAuthResponse, { access_token: string; user_id: number; email: string | null }>({
            query: (body) => ({
                url: `/vk/id`,
                method: "POST",
                body,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterVolunteerMutation,
    useRegisterNPOMutation,
    useGetSelectedCityQuery,
    useUpdateSelectedCityMutation,
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
    useVkAuthMutation,
    useVkIdAuthMutation,
} = authApi;
