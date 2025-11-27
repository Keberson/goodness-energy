import { Card, Typography, Tag, Space, Button, Flex } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useGetNewsByIdQuery } from "@services/api/news.api";
import { useGetPostByIdQuery } from "@services/api/volunteer-posts.api";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import NewsContent from "@components/NewsContent/NewsContent";
import useAppSelector from "@hooks/useAppSelector";
import type { INews } from "@app-types/news.types";
import type { IVolunteerPost } from "@app-types/volunteer-posts.types";
import "./styles.scss";

const { Title, Paragraph } = Typography;

const NewsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const newsId = id ? Number(id) : 0;

    // Определяем, это пост волонтера или новость
    const isVolunteerPost = location.pathname.startsWith("/volunteer-posts");

    // Используем соответствующий API
    const {
        data: newsDataRaw,
        isLoading: isLoadingNews,
        error: newsError,
    } = useGetNewsByIdQuery(newsId, {
        skip: !id || isNaN(newsId) || isVolunteerPost,
    });

    const {
        data: postDataRaw,
        isLoading: isLoadingPost,
        error: postError,
    } = useGetPostByIdQuery(newsId, {
        skip: !id || isNaN(newsId) || !isVolunteerPost,
    });

    // Объединяем данные и состояние загрузки
    const data = isVolunteerPost
        ? (postDataRaw as IVolunteerPost | undefined)
        : (newsDataRaw as INews | undefined);
    const isLoading = isVolunteerPost ? isLoadingPost : isLoadingNews;
    const error = isVolunteerPost ? postError : newsError;

    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);

    // Проверяем, может ли пользователь редактировать новость/пост (администратор или автор)
    const canEdit = userType === "admin" || (data && userId === data.user_id);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            theme: "Публикация",
            docs: "Документы",
            system: "Системный",
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            theme: "green",
            docs: "orange",
            system: "blue",
        };
        return colors[type] || "default";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            approved: "Одобрено",
            pending: "На модерации",
            rejected: "Отклонено",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            approved: "green",
            pending: "orange",
            rejected: "red",
        };
        return colors[status] || "default";
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
                    <Title level={3}>
                        {isVolunteerPost ? "История не найдена" : "Новость не найдена"}
                    </Title>
                    {error && "status" in error && error.status === 404 && (
                        <Paragraph>
                            {isVolunteerPost
                                ? "Запрошенная история не существует"
                                : "Запрошенная новость не существует"}
                        </Paragraph>
                    )}
                </Card>
            </div>
        );
    }

    const postData = isVolunteerPost ? (data as IVolunteerPost) : null;
    const newsData = !isVolunteerPost ? (data as INews) : null;

    return (
        <div style={{ padding: 24, minHeight: "calc(100vh - 48px)" }} className="news-page">
            <Card>
                <Flex justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(isVolunteerPost ? "/volunteer-posts" : "/news")}
                        style={{ padding: 0 }}
                    >
                        {isVolunteerPost ? "Назад к списку историй" : "Назад к списку новостей"}
                    </Button>
                    <Space>
                        {!isVolunteerPost && <FavoriteButton itemType="news" itemId={data.id} />}
                        {canEdit && (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() =>
                                    navigate(
                                        isVolunteerPost
                                            ? `/volunteer-posts/edit/${data.id}`
                                            : `/news/edit/${data.id}`
                                    )
                                }
                            >
                                Редактировать
                            </Button>
                        )}
                    </Space>
                </Flex>
                <Title level={2} style={{ marginBottom: 16 }}>
                    {data.name}
                </Title>
                <div
                    style={{
                        marginBottom: 24,
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <Space>
                            <UserOutlined />
                            <span>{data.author}</span>
                        </Space>
                        <Space wrap>
                            {!isVolunteerPost && newsData && (
                                <Tag color={getTypeColor(newsData.type)}>
                                    {getTypeLabel(newsData.type)}
                                </Tag>
                            )}
                            {isVolunteerPost && postData && postData.status && (
                                <Tag color={getStatusColor(postData.status)}>
                                    {getStatusLabel(postData.status)}
                                </Tag>
                            )}
                            {isVolunteerPost && postData && postData.theme_tag && (
                                <Tag color="blue">{postData.theme_tag}</Tag>
                            )}
                            {isVolunteerPost && postData && postData.city && (
                                <Tag>📍 {postData.city}</Tag>
                            )}
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
