export type NewsType = "theme" | "docs" | "system"; // theme - публикация, docs - документы, system - системный
export type NewsStatus = "published" | "rejected" | "pending"; // published - Опубликовано, rejected - Отклонено, pending - На проверке

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
    status: NewsStatus; // Статус новости
    explanation?: string; // Пояснение модератора, если есть
}

export interface INewsCreate {
    name: string;
    annotation?: string;
    text: string;
    city?: string;
    attachedIds?: number[];
    tags?: string[];
    type: NewsType;
    status?: NewsStatus; // Статус новости
    explanation?: string; // Пояснение модератора, если есть
}

export interface INewsUpdate {
    name?: string;
    annotation?: string;
    text?: string;
    city?: string;
    attachedIds?: number[];
    tags?: string[];
    type?: NewsType;
    status?: NewsStatus; // Статус новости
    explanation?: string; // Пояснение модератора, если есть
}

