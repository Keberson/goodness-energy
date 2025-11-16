import type { INews } from "./news.types";
import type { IEvent } from "./events.types";
import type { IKnowledge } from "./knowledges.types";

export type FavoriteType = "news" | "event" | "knowledge";

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
    item: INews | IEvent | IKnowledge;
}

export interface IFavoriteCheck {
    is_favorite: boolean;
}

