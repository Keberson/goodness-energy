export interface INPO {
    id: number;
    name: string;
    description: string | null;
    coordinates: [number, number];
    address: string;
    city: string;
    timetable: string | null;
    galleryIds: number[];
    tags: string[];
    links: Record<string, string>;
    vacancies: number;
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
    galleryIds: number[];
    tags: string[];
    links: Record<string, string>;
    timetable: string | null;
    city: string;
    address: string;
    coordinates: [number, number];
}
