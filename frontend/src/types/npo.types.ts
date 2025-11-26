export type NPOStatus = "confirmed" | "not_confirmed";

export interface INPO {
    id: number;
    name: string;
    description: string | null;
    page_content: string | null; // HTML-контент страницы профиля
    coordinates: [number, number] | null;
    address: string;
    city: string;
    timetable: string | null;
    galleryIds: number[];
    tags: string[];
    links: Record<string, string> | null;
    vacancies: number;
    status?: NPOStatus;
    created_at: string;
}

export interface INPOCreate {
    login: string;
    password: string;
    name: string;
    description: string;
    coordinates: undefined;
    address: string;
    city: string;
    tags: string[];
    links: { type: string; url: string }[];
    timetable: string;
}

export interface INPOEdit {
    name: string;
    description: string;
    tags: string[];
    links: { type: string; url: string }[];
    timetable: string;
    city: string;
    address: string;
    coordinates: [number, number];
}


export interface INPOEditRequest {
    name: string;
    description: string;
    page_content?: string; // HTML-контент страницы профиля
    galleryIds: number[];
    tags: string[];
    links: Record<string, string>;
    timetable: string | null;
    city: string;
    address: string;
    coordinates: [number, number];
}

export interface IProfileViewerStats {
    viewer_id: number | null;
    viewer_login: string | null;
    view_count: number;
    last_viewed_at: string | null;
}

export interface IEventStats {
    event_id: number;
    event_name: string;
    view_count: number;
    response_count: number;
    status: string;
    created_at: string;
}

export interface INPOStatistics {
    total_profile_views: number;
    unique_viewers: number;
    profile_viewers: IProfileViewerStats[];
    total_events: number;
    events_by_status: Record<string, number>;
    event_stats: IEventStats[];
    total_news: number;
    total_event_responses: number;
}