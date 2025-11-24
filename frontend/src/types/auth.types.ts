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
    login: string;
    password: string;
    firstName: string;
    secondName: string;
    middleName: string;
    about: string;
    birthday: string;
    city: string;
    sex: string;
    email: string;
    phone: string;
}

export interface IRegNPORequest {
    login: string;
    password: string;
    name: string;
    description: string;
    coordinates: [number, number];
    address: string;
    tags: string[];
    links: Record<string, string>;
    timetable: string;
}
