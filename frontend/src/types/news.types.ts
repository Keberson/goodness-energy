export type NewsType = "blog" | "edu" | "docs";

export interface INews {
    id: number;
    name: string;
    text: string;
    attachedIds: number[];
    tags: string[];
    type: NewsType;
    created_at: string;
}

export interface INewsCreate {
    name: string;
    text: string;
    attachedIds?: number[];
    tags?: string[];
    type: NewsType;
}

export interface INewsUpdate {
    name?: string;
    text?: string;
    attachedIds?: number[];
    tags?: string[];
    type?: NewsType;
}

