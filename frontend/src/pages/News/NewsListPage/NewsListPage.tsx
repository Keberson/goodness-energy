import { useState, useEffect } from "react";
import { Card, List, Typography, Tag, Space, Button, Empty, Flex, Tabs, Popconfirm, App, Select } from "antd";
import { EyeOutlined, CalendarOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetNewsQuery, useGetMyNewsQuery, useDeleteNewsMutation } from "@services/api/news.api";
import { useGetVolunteerPostsQuery, useGetMyPostsQuery, useDeletePostMutation, useGetAvailableThemesQuery } from "@services/api/volunteer-posts.api";
import { useGetNPOByIdQuery } from "@services/api/npo.api";
import type { INews } from "@app-types/news.types";
import type { IVolunteerPost } from "@app-types/volunteer-posts.types";
import { useCity } from "@hooks/useCity";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";

const { Title } = Typography;
const { Option } = Select;

interface NewsListPageProps {
    section?: "posts" | "news";
}

const NewsListPage = ({ section }: NewsListPageProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentCity, availableCities } = useCity();
    
    // Определяем активный раздел из пропсов или из URL
    const getInitialSection = (): "posts" | "news" => {
        if (section) return section;
        if (location.pathname.startsWith("/volunteer-posts")) return "posts";
        return "news";
    };
    
    const [activeSection, setActiveSection] = useState<"posts" | "news">(getInitialSection());
    
    // Обновляем раздел при изменении URL
    useEffect(() => {
        const newSection = getInitialSection();
        if (newSection !== activeSection) {
            setActiveSection(newSection);
        }
    }, [location.pathname]);
    const [activeTab, setActiveTab] = useState("all");
    const [filterCity, setFilterCity] = useState<string | undefined>(undefined);
    const [filterTheme, setFilterTheme] = useState<string | undefined>(undefined);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);
    const isNPO = isAuthenticated && userType === "npo";
    const isVolunteer = isAuthenticated && userType === "volunteer";
    
    const { data: availableThemes = [] } = useGetAvailableThemesQuery(undefined, {
        skip: activeSection !== "posts",
    });

    // Блоги волонтеров (посты)
    const { data: allPosts, isLoading: isLoadingAllPosts } = useGetVolunteerPostsQuery(
        { status: "approved", city: filterCity, theme_tag: filterTheme },
        { skip: activeSection !== "posts" || activeTab !== "all" }
    );
    const { data: cityPosts, isLoading: isLoadingCityPosts } = useGetVolunteerPostsQuery(
        { city: currentCity || undefined, status: "approved", theme_tag: filterTheme },
        { skip: !currentCity || activeSection !== "posts" || activeTab !== "city" }
    );
    const { data: myPosts, isLoading: isLoadingMyPosts } = useGetMyPostsQuery(undefined, {
        skip: !isAuthenticated || activeSection !== "posts" || activeTab !== "my" || !isVolunteer,
    });
    const [deletePost] = useDeletePostMutation();

    // Новости от НКО и админов
    const { data: allNews, isLoading: isLoadingAll } = useGetNewsQuery(undefined, {
        skip: activeSection !== "news",
    });
    const { data: cityNews, isLoading: isLoadingCity } = useGetNewsQuery(currentCity, {
        skip: !currentCity || activeSection !== "news" || activeTab !== "city",
    });
    const { data: myNews, isLoading: isLoadingMy } = useGetMyNewsQuery(undefined, {
        skip: !isAuthenticated || activeSection !== "news" || activeTab !== "my",
    });
    const [deleteNews] = useDeleteNewsMutation();
    const { message } = App.useApp();
    
    // Получаем данные НКО для проверки статуса
    const { data: npoData } = useGetNPOByIdQuery(isNPO && userId ? userId : skipToken);
    const isNPOConfirmed = isNPO && npoData?.status === "confirmed";
    // НКО и админы могут создавать новости, волонтёры - только посты
    const canCreateNews = isAuthenticated && (isNPO && isNPOConfirmed || userType === "admin");
    const canCreatePost = isAuthenticated && isVolunteer;
    
    // Данные в зависимости от активного раздела
    const postsData =
        activeTab === "my" ? myPosts : activeTab === "city" ? cityPosts : allPosts;
    const postsLoading =
        activeTab === "my"
            ? isLoadingMyPosts
            : activeTab === "city"
            ? isLoadingCityPosts
            : isLoadingAllPosts;
    
    const newsData =
        activeTab === "my" ? myNews : activeTab === "city" ? cityNews : allNews;
    const newsLoading =
        activeTab === "my"
            ? isLoadingMy
            : activeTab === "city"
            ? isLoadingCity
            : isLoadingAll;

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

    const handleDeleteNews = async (newsId: number) => {
        try {
            await deleteNews(newsId).unwrap();
            message.success("Новость успешно удалена");
        } catch (error) {
            message.error("Ошибка при удалении новости");
        }
    };

    const handleDeletePost = async (postId: number) => {
        try {
            await deletePost(postId).unwrap();
            message.success("Пост успешно удален");
        } catch (error) {
            message.error("Ошибка при удалении поста");
        }
    };

    const renderPostItem = (item: IVolunteerPost) => {
        const isMyPost = activeTab === "my" && isVolunteer;
        const actions = [];

        if (isMyPost) {
            actions.push(
                <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/volunteer-posts/edit/${item.id}`)}
                >
                    Редактировать
                </Button>,
                <Popconfirm
                    key="delete"
                    title="Удалить пост?"
                    description={`Вы уверены, что хотите удалить пост "${item.name}"?`}
                    onConfirm={() => handleDeletePost(item.id)}
                    okText="Да"
                    cancelText="Нет"
                >
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                    >
                        Удалить
                    </Button>
                </Popconfirm>
            );
        }

        actions.push(
            <Button
                key="details"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/volunteer-posts/${item.id}`)}
            >
                Подробнее
            </Button>
        );

        return (
            <List.Item key={item.id} actions={actions}>
                <List.Item.Meta
                    title={
                        <Space align="center" wrap>
                            <Title level={4} style={{ margin: 0 }}>
                                {item.name}
                            </Title>
                            {item.theme_tag && (
                                <Tag color="blue">{item.theme_tag}</Tag>
                            )}
                            {item.npo_name && (
                                <Tag color="purple">НКО: {item.npo_name}</Tag>
                            )}
                        </Space>
                    }
                    description={
                        <Space wrap>
                            <Space>
                                <UserOutlined />
                                <span>{item.author}</span>
                            </Space>
                            {item.city && (
                                <Space>
                                    <span>📍 {item.city}</span>
                                </Space>
                            )}
                            <Space>
                                <CalendarOutlined />
                                <span>
                                    {new Date(item.created_at).toLocaleDateString(
                                        "ru-RU",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </Space>
                        </Space>
                    }
                />
                {item.annotation ? (
                    <div
                        style={{
                            marginTop: 8,
                            color: "rgba(0, 0, 0, 0.65)",
                            lineHeight: 1.5,
                        }}
                    >
                        {item.annotation}
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 8,
                            color: "rgba(0, 0, 0, 0.45)",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                        }}
                    >
                        Нет описания
                    </div>
                )}
                {item.tags && item.tags.length > 0 && (
                    <Space wrap style={{ marginTop: 8 }}>
                        {item.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                    </Space>
                )}
            </List.Item>
        );
    };

    const renderNewsItem = (item: INews) => {
        const isMyNews = activeTab === "my";
        const actions = [];

        if (isMyNews) {
            actions.push(
                <Button
                    key="edit"
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/news/edit/${item.id}`)}
                >
                    Редактировать
                </Button>,
                <Popconfirm
                    key="delete"
                    title="Удалить новость?"
                    description={`Вы уверены, что хотите удалить новость "${item.name}"?`}
                    onConfirm={() => handleDeleteNews(item.id)}
                    okText="Да"
                    cancelText="Нет"
                >
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                    >
                        Удалить
                    </Button>
                </Popconfirm>
            );
        }

        actions.push(
            <Button
                key="details"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/news/${item.id}`)}
            >
                Подробнее
            </Button>
        );

        return (
            <List.Item key={item.id} actions={actions}>
                <List.Item.Meta
                    title={
                        <Space align="center" wrap>
                            <Title level={4} style={{ margin: 0 }}>
                                {item.name}
                            </Title>
                            <FavoriteButton
                                key="favorite"
                                itemType="news"
                                itemId={item.id}
                                size="small"
                            />
                            <Tag color={getTypeColor(item.type)}>
                                {getTypeLabel(item.type)}
                            </Tag>
                        </Space>
                    }
                    description={
                        <Space wrap>
                            <Space>
                                <UserOutlined />
                                <span>{item.author}</span>
                            </Space>
                            <Space>
                                <CalendarOutlined />
                                <span>
                                    {new Date(item.created_at).toLocaleDateString(
                                        "ru-RU",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </Space>
                        </Space>
                    }
                />
                {item.annotation ? (
                    <div
                        style={{
                            marginTop: 8,
                            color: "rgba(0, 0, 0, 0.65)",
                            lineHeight: 1.5,
                        }}
                    >
                        {item.annotation}
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 8,
                            color: "rgba(0, 0, 0, 0.45)",
                            fontStyle: "italic",
                            lineHeight: 1.5,
                        }}
                    >
                        Нет описания
                    </div>
                )}
                {item.tags && item.tags.length > 0 && (
                    <Space wrap style={{ marginTop: 8 }}>
                        {item.tags.map((tag) => (
                            <Tag key={tag}>{tag}</Tag>
                        ))}
                    </Space>
                )}
            </List.Item>
        );
    };

    return (
        <div style={{ padding: 24, minHeight: "calc(100vh - 48px)" }}>
            <Card style={{ minHeight: "calc(100vh - 96px)" }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 0 }}>
                        {activeSection === "posts" ? "Истории волонтеров" : "Новости"}
                    </Title>
                    <Space>
                        {activeSection === "posts" && canCreatePost && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate("/volunteer-posts/edit")}
                            >
                                Создать историю
                            </Button>
                        )}
                        {activeSection === "news" && canCreateNews && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate("/news/edit")}
                            >
                                Создать новость
                            </Button>
                        )}
                    </Space>
                </Flex>
                {activeSection === "posts" && activeTab !== "my" && (
                    <Flex gap="middle" style={{ marginBottom: 16 }}>
                        <Select
                            allowClear
                            placeholder="Фильтр по городу"
                            value={filterCity}
                            onChange={(value) => setFilterCity(value)}
                            style={{ width: 200 }}
                        >
                            {availableCities.map((cityName: string) => (
                                <Option key={cityName} value={cityName}>
                                    {cityName}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            allowClear
                            placeholder="Фильтр по тематике"
                            value={filterTheme}
                            onChange={(value) => setFilterTheme(value)}
                            style={{ width: 200 }}
                        >
                            {availableThemes.map((theme) => (
                                <Option key={theme} value={theme}>
                                    {theme}
                                </Option>
                            ))}
                        </Select>
                    </Flex>
                )}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: "all",
                            label: activeSection === "posts" ? "Все истории" : "Все новости",
                        },
                        {
                            key: "city",
                            label: `${activeSection === "posts" ? "Истории" : "Новости"} города ${currentCity || ""}`.trim(),
                        },
                        ...(isAuthenticated && (activeSection === "posts" ? isVolunteer : true)
                            ? [
                                  {
                                      key: "my",
                                      label: activeSection === "posts" ? "Мои истории" : "Мои новости",
                                  },
                              ]
                            : []),
                    ]}
                    style={{ marginBottom: 24 }}
                />
                {activeSection === "posts" ? (
                    postsLoading ? (
                        <List loading={postsLoading} />
                    ) : !postsData || postsData.length === 0 ? (
                        <Empty description={activeTab === "my" ? "У вас пока нет историй" : "Историй пока нет"} />
                    ) : (
                        <List
                            itemLayout="vertical"
                            dataSource={postsData}
                            renderItem={renderPostItem}
                        />
                    )
                ) : (
                    newsLoading ? (
                        <List loading={newsLoading} />
                    ) : !newsData || newsData.length === 0 ? (
                        <Empty description={activeTab === "my" ? "У вас пока нет новостей" : "Новостей пока нет"} />
                    ) : (
                        <List
                            itemLayout="vertical"
                            dataSource={newsData}
                            renderItem={renderNewsItem}
                        />
                    )
                )}
            </Card>
        </div>
    );
};

export default NewsListPage;
