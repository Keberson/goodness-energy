import { Card, Typography, Empty, Tag, Space, Button, Divider } from "antd";
import { CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useGetFavoritesQuery } from "@services/api/favorites.api";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import type { IFavoriteItem, FavoriteType } from "@app-types/favorites.types";
import type { INews } from "@app-types/news.types";
import type { IEvent } from "@app-types/events.types";
import type { IKnowledge } from "@app-types/knowledges.types";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useCity } from "@hooks/useCity";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;

const FavoritesPage = () => {
    const { data: favorites, isLoading } = useGetFavoritesQuery();
    const navigate = useNavigate();
    const { currentCity, changeCity } = useCity();

    const getItemTypeLabel = (type: FavoriteType): string => {
        const labels: Record<FavoriteType, string> = {
            news: "Новости",
            event: "События",
            knowledge: "Материалы",
        };
        return labels[type];
    };

    const handleItemClick = (itemType: FavoriteType, itemId: number, item?: INews | IEvent | IKnowledge) => {
        if (itemType === "news") {
            navigate(`/news/${itemId}`);
        } else if (itemType === "event" && item) {
            const event = item as IEvent;

            // Если событие из другого города, переключаем текущий город,
            // чтобы оно отобразилось в календаре событий
            if (event.city && event.city !== currentCity) {
                void changeCity(event.city);
            }

            // Передаем дату начала события через URL параметр
            const eventDate = dayjs(event.start).format("YYYY-MM-DD");
            navigate(`/events?date=${eventDate}`);
        } else if (itemType === "knowledge") {
            navigate(`/knowledges/${itemId}`);
        }
    };

    // Цвета тегов такие же, как на главной и в календаре
    const getTagColor = (tag: string): string => {
        const colors = [
            "red",
            "orange",
            "gold",
            "lime",
            "green",
            "cyan",
            "blue",
            "geekblue",
            "purple",
            "magenta",
            "volcano",
            "geekblue",
            "cyan",
            "blue",
            "purple",
            "magenta",
            "red",
            "orange",
            "gold",
            "lime",
        ];

        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const renderNewsItem = (item: INews) => (
        <Card
            hoverable
            onClick={() => handleItemClick("news", item.id, item)}
            style={{ marginBottom: 16 }}
        >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div>
                    <Space align="center" wrap>
                        <Title level={4} style={{ margin: 0 }}>
                            {item.name}
                        </Title>
                        <FavoriteButton itemType="news" itemId={item.id} size="small" />
                    </Space>
                </div>
                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                    {item.text}
                </Paragraph>
                <Space wrap>
                    {item.tags.map((tag) => (
                        <Tag key={tag} color={getTagColor(tag)}>
                            {tag}
                        </Tag>
                    ))}
                    <Text type="secondary">
                        <CalendarOutlined /> {dayjs(item.created_at).format("DD.MM.YYYY")}
                    </Text>
                </Space>
            </Space>
        </Card>
    );

    const renderEventItem = (item: IEvent) => (
        <Card
            hoverable
            onClick={() => handleItemClick("event", item.id, item)}
            style={{ marginBottom: 16 }}
        >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div>
                    <Space align="center" wrap>
                        <Title level={4} style={{ margin: 0 }}>
                            {item.name}
                        </Title>
                        <FavoriteButton itemType="event" itemId={item.id} size="small" />
                    </Space>
                </div>
                {item.description && (
                    <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                        {item.description}
                    </Paragraph>
                )}
                <Space wrap>
                    {item.tags.map((tag) => (
                        <Tag key={tag} color={getTagColor(tag)}>
                            {tag}
                        </Tag>
                    ))}
                    {item.city && (
                        <Text type="secondary">
                            {item.city}
                        </Text>
                    )}
                    <Text type="secondary">
                        <CalendarOutlined /> {dayjs(item.start).format("DD.MM.YYYY HH:mm")} - {dayjs(item.end).format("DD.MM.YYYY HH:mm")}
                    </Text>
                </Space>
            </Space>
        </Card>
    );

    const renderKnowledgeItem = (item: IKnowledge) => (
        <Card
            hoverable
            onClick={() => handleItemClick("knowledge", item.id, item)}
            style={{ marginBottom: 16 }}
        >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div>
                    <Space align="center" wrap>
                        <Title level={4} style={{ margin: 0 }}>
                            {item.name}
                        </Title>
                        <FavoriteButton itemType="knowledge" itemId={item.id} size="small" />
                    </Space>
                </div>
                <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                    {item.text}
                </Paragraph>
                <Space wrap>
                    {item.tags.map((tag) => (
                        <Tag key={tag} color={getTagColor(tag)}>
                            {tag}
                        </Tag>
                    ))}
                    <Text type="secondary">
                        <CalendarOutlined /> {dayjs(item.created_at).format("DD.MM.YYYY")}
                    </Text>
                </Space>
            </Space>
        </Card>
    );

    const renderFavoriteItem = (favorite: IFavoriteItem) => {
        if (favorite.item_type === "news") {
            return renderNewsItem(favorite.item as INews);
        } else if (favorite.item_type === "event") {
            return renderEventItem(favorite.item as IEvent);
        } else if (favorite.item_type === "knowledge") {
            return renderKnowledgeItem(favorite.item as IKnowledge);
        }
        return null;
    };

    // Группируем избранное по типам
    const groupedFavorites = favorites?.reduce(
        (acc, favorite) => {
            if (!acc[favorite.item_type]) {
                acc[favorite.item_type] = [];
            }
            acc[favorite.item_type].push(favorite);
            return acc;
        },
        {} as Record<FavoriteType, IFavoriteItem[]>
    ) || {};

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/profile")}
                    style={{ marginBottom: 16, padding: 0 }}
                >
                    Назад в личный кабинет
                </Button>
                <Title level={2} style={{ marginBottom: 24 }}>
                    Избранное
                </Title>

                {isLoading ? (
                    <Card loading={isLoading} />
                ) : !favorites || favorites.length === 0 ? (
                    <Empty
                        description="У вас пока нет избранных элементов"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <div>
                        {Object.entries(groupedFavorites).map(([type, items]) => {
                            const typedItems = items as IFavoriteItem[];
                            return (
                                <div key={type} style={{ marginBottom: 32 }}>
                                    <Title level={3} style={{ marginBottom: 8 }}>
                                        {getItemTypeLabel(type as FavoriteType)}
                                    </Title>
                                    <Divider />
                                    {typedItems.map((favorite: IFavoriteItem) => (
                                        <div key={favorite.favorite_id}>
                                            {renderFavoriteItem(favorite)}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default FavoritesPage;

