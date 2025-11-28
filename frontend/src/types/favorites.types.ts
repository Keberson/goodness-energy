import type { INews } from "./news.types";
import type { IEvent } from "./events.types";
import type { IKnowledge } from "./knowledges.types";
import type { IVolunteerPost } from "./volunteer-posts.types";

export type FavoriteType = "news" | "event" | "knowledge" | "volunteer_post";

export interface IFavorite {
    id: number;
    user_id: number;
    item_type: FavoriteType;
    item_id: number;
    created_at: string;
}

export interface IFavoriteCreate {
    item_type: FavoriteType;
    item_id: number;
}

export interface IFavoriteItem {
    favorite_id: number;
    item_type: FavoriteType;
    item_id: number;
    created_at: string;
    item: INews | IEvent | IKnowledge | IVolunteerPost;
}

export interface IFavoriteCheck {
    is_favorite: boolean;
}

