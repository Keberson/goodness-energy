export interface IMapItem {
    coordinates: [number, number];
    info: {
        id: number;
        name: string;
        description: string;
        coordinates: [number, number];
        address: string;
        timetable: string | null;
        galleryIds: number[];
        tags: string[];
        links: Record<string, string>;
        vacancies: number;
        created_at: string;
    };
}
