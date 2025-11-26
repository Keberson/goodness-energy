export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface IEvent {
    id: number;
    npo_id: number;
    npo_name?: string | null; // Название НКО, проводящего событие
    name: string;
    description: string | null;
    start: string;
    end: string;
    coordinates: [number, number] | null; // [lat, lon]
    quantity: number | null;
    status: EventStatus;
    tags: string[];
    city: string | null; // Город НКО, создавшего событие
    attachedIds: number[]; // ID файлов (изображений)
    created_at: string;
}

