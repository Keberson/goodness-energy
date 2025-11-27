export type NewsType = "theme" | "docs" | "system"; // theme - публикация, docs - документы, system - системный

export interface INews {
    id: number;
    name: string;
    annotation?: string;
    text: string;
    city?: string;
    attachedIds: number[];
    tags: string[];
    type: NewsType;
    created_at: string;
    user_id: number; // ID пользователя, создавшего новость
    author: string; // Имя автора: для волонтёра - имя и фамилия, для НКО - название НКО, для админа - "Администратор"
}

export interface INewsCreate {
    name: string;
    annotation?: string;
    text: string;
    city?: string;
    attachedIds?: number[];
    tags?: string[];
    type: NewsType;
}

export interface INewsUpdate {
    name?: string;
    annotation?: string;
    text?: string;
    city?: string;
    attachedIds?: number[];
    tags?: string[];
    type?: NewsType;
}

