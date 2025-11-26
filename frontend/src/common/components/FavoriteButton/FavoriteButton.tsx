import { Button, Tooltip } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { useAddFavoriteMutation, useRemoveFavoriteMutation, useCheckFavoriteQuery } from "@services/api/favorites.api";
import type { FavoriteType } from "@app-types/favorites.types";
import { skipToken } from "@reduxjs/toolkit/query";
import useAppSelector from "@hooks/useAppSelector";

interface FavoriteButtonProps {
    itemType: FavoriteType;
    itemId: number;
    size?: "small" | "middle" | "large";
}

const FavoriteButton = ({ itemType, itemId, size = "middle" }: FavoriteButtonProps) => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    
    // НКО не могут добавлять в избранное
    if (!isAuthenticated || userType === "npo") {
        return null;
    }
    
    const { data: checkData } = useCheckFavoriteQuery(
        { item_type: itemType, item_id: itemId }
    );
    
    const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
    const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();
    
    const isFavorite = checkData?.is_favorite ?? false;
    const isLoading = isAdding || isRemoving;
    
    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем всплытие события, чтобы не вызывать onClick родительских элементов
        
        try {
            if (isFavorite) {
                await removeFavorite({ item_type: itemType, item_id: itemId }).unwrap();
            } else {
                await addFavorite({ item_type: itemType, item_id: itemId }).unwrap();
            }
        } catch (error) {
            console.error("Ошибка при изменении избранного:", error);
        }
    };
    
    return (
        <Tooltip title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}>
            <Button
                type="text"
                icon={isFavorite ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                onClick={handleToggle}
                loading={isLoading}
                size={size}
            />
        </Tooltip>
    );
};

export default FavoriteButton;

