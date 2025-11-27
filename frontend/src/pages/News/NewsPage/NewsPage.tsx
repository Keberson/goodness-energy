import { Card, Typography, Tag, Space, Button } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
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
            theme: "Тематика",
            docs: "Документы",
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            theme: "green",
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
                <Space
                    align="center"
                    wrap
                    size="middle"
                    style={{ marginBottom: 8 }}
                >
                    <Title level={2} style={{ marginBottom: 0 }}>
                        {data.name}
                    </Title>
                    <FavoriteButton itemType="news" itemId={data.id} />
                    {canEdit && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/news/edit/${data.id}`)}
                        >
                            Редактировать
                        </Button>
                    )}
                </Space>
                <div style={{ marginBottom: 24, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Space>
                            <UserOutlined />
                            <span>{data.author}</span>
                        </Space>
                        <Space>
                            <Tag color={getTypeColor(data.type)}>{getTypeLabel(data.type)}</Tag>
                        </Space>
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
                        {data.tags && data.tags.length > 0 && (
                            <Space wrap>
                                {data.tags.map((tag) => (
                                    <Tag key={tag}>{tag}</Tag>
                                ))}
                            </Space>
                        )}
                    </Space>
                </div>
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
