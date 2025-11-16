export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface IEvent {
    id: number;
    npo_id: number;
    name: string;
    description: string | null;
    start: string;
    end: string;
    coordinates: [number, number] | null; // [lat, lon]
    quantity: number | null;
    status: EventStatus;
    tags: string[];
    city: string | null; // Город НКО, создавшего событие
    created_at: string;
}

