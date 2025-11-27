export type UserTypes = "npo" | "admin" | "volunteer";

export interface INotificationSettings {
    notify_city_news: boolean;
    notify_registrations: boolean;
    notify_events: boolean;
}

export interface INotificationSettingsUpdate {
    notify_city_news?: boolean;
    notify_registrations?: boolean;
    notify_events?: boolean;
}

export interface ILoginRequest {
    login: string;
    password: string;
}

export interface IAuthResponse {
    access_token: string;
    token_type: string;
    user_type: UserTypes;
    id: number;
}

export interface IRegVolunteerRequest {
    login?: string;  // Опционально при регистрации через VK
    password?: string;  // Опционально при регистрации через VK
    firstName: string;
    secondName: string;
    middleName?: string;
    about?: string;
    birthday?: string;
    city?: string;
    sex?: string;
    email?: string;
    phone?: string;
    vk_id?: number;
}

export interface IRegNPORequest {
    login?: string;  // Опционально при регистрации через VK
    password?: string;  // Опционально при регистрации через VK
    name: string;
    description: string;
    coordinates: [number, number];
    address: string;
    tags: string[];
    links: Record<string, string>;
    timetable: string;
    email?: string;  // Email для регистрации через VK
    vk_id?: number;  // VK ID для привязки аккаунта
}

export interface IVKIDAuthResponse {
    user_exists: boolean;
    token?: IAuthResponse;
    vk_id?: number;
    vk_data?: {
        first_name: string;
        last_name: string;
        email?: string;
        bdate?: string;  // Дата рождения в формате "DD.MM.YYYY" или "DD.MM"
        sex?: number;  // 1 - женский, 2 - мужской, 0 - не указан
        city?: string;  // Название города
        phone?: string;  // Телефон
    };
}