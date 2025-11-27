export type VolunteerPostStatus = "pending" | "approved" | "rejected";

export interface IVolunteerPost {
    id: number;
    name: string;
    annotation?: string;
    text: string;
    city?: string;
    theme_tag?: string; // Тематика
    npo_id?: number;
    npo_name?: string;
    status: VolunteerPostStatus;
    moderator_id?: number;
    moderation_comment?: string;
    attachedIds: number[];
    tags: string[];
    created_at: string;
    updated_at?: string;
    moderated_at?: string;
    user_id: number;
    volunteer_id: number;
    author: string; // Имя и фамилия волонтера
}

export interface IVolunteerPostCreate {
    name: string;
    annotation?: string;
    text: string;
    city?: string;
    theme_tag?: string;
    npo_id?: number;
    attachedIds?: number[];
    tags?: string[];
}

export interface IVolunteerPostUpdate {
    name?: string;
    annotation?: string;
    text?: string;
    city?: string;
    theme_tag?: string;
    npo_id?: number;
    attachedIds?: number[];
    tags?: string[];
}

export interface IVolunteerPostModeration {
    status: VolunteerPostStatus;
    comment?: string;
}

