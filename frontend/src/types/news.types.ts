export type NewsType = "blog" | "edu" | "docs";

export interface INews {
    id: number;
    name: string;
    annotation?: string;
    text: string;
    attachedIds: number[];
    tags: string[];
    type: NewsType;
    created_at: string;
    user_id: number; // ID пользователя, создавшего новость
}

export interface INewsCreate {
    name: string;
    annotation?: string;
    text: string;
    attachedIds?: number[];
    tags?: string[];
    type: NewsType;
}

export interface INewsUpdate {
    name?: string;
    annotation?: string;
    text?: string;
    attachedIds?: number[];
    tags?: string[];
    type?: NewsType;
}

