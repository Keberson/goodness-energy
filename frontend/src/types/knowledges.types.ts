export interface IKnowledge {
    id: number;
    name: string;
    text: string;
    attachedIds: number[] | null;
    tags: string[];
    links: string[] | null;
    created_at: string;
}
