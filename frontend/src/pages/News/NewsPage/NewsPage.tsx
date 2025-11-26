import { Card, Typography, Tag, Space, Descriptions, Button, Flex } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useGetNewsByIdQuery } from "@services/api/news.api";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import NewsContent from "@components/NewsContent/NewsContent";
import useAppSelector from "@hooks/useAppSelector";
import "./styles.scss";

const { Title, Paragraph } = Typography;

const NewsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const newsId = id ? Number(id) : 0;
    const { data, isLoading, error } = useGetNewsByIdQuery(newsId, {
        skip: !id || isNaN(newsId),
    });
    
    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);
    
    // Проверяем, может ли пользователь редактировать новость (администратор или автор)
    const canEdit = userType === "admin" || (data && userId === data.user_id);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            blog: "Блог",
            edu: "Образование",
            docs: "Документы",
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            blog: "blue",
            edu: "green",
            docs: "orange",
        };
        return colors[type] || "default";
    };

    if (isLoading) {
        return (
            <div style={{ padding: 24 }}>
                <Card loading={isLoading} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Title level={3}>Новость не найдена</Title>
                    {error && "status" in error && error.status === 404 && (
                        <Paragraph>Запрошенная новость не существует</Paragraph>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, minHeight: "calc(100vh - 48px)" }} className="news-page">
            <Card>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/news")}
                    style={{ marginBottom: 16, padding: 0 }}
                >
                    Назад к списку новостей
                </Button>
                <Flex
                    justify="space-between"
                    align="center"
                    style={{ marginBottom: 24 }}
                    wrap="wrap"
                    gap={8}
                >
                    <Title level={2} style={{ marginBottom: 0 }}>
                        {data.name}
                    </Title>
                    <Space>
                        {canEdit && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/news/edit/${data.id}`)}
                            >
                                Редактировать
                            </Button>
                        )}
                        <FavoriteButton itemType="news" itemId={data.id} />
                    </Space>
                </Flex>
                <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
                    <Descriptions.Item label="Автор">
                        {data.author}
                    </Descriptions.Item>
                    <Descriptions.Item label="Тип">
                        <Tag color={getTypeColor(data.type)}>{getTypeLabel(data.type)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Дата создания">
                        <Space>
                            <CalendarOutlined />
                            <span>
                                {new Date(data.created_at).toLocaleDateString("ru-RU", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </Space>
                    </Descriptions.Item>
                    {data.tags && data.tags.length > 0 && (
                        <Descriptions.Item label="Теги">
                            <Space wrap>
                                {data.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </Space>
                        </Descriptions.Item>
                    )}
                </Descriptions>
                <Title level={4}>Содержание</Title>
                <NewsContent
                    html={data.text}
                    className="news-content"
                    style={{
                        fontSize: 16,
                        lineHeight: 1.8,
                    }}
                />
            </Card>
        </div>
    );
};

export default NewsPage;
