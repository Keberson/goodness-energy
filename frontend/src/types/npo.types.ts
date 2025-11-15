export interface INPO {
    id: number;
    name: string;
    description: string | null;
    coordinates: [number, number];
    address: string;
    timetable: string | null;
    galleryIds: string[];
    tags: string[];
    links: Record<string, string>;
    vacancies: number;
    created_at: string;
}
