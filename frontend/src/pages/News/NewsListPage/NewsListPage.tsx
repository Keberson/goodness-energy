import { useState } from "react";
import { Card, List, Typography, Tag, Space, Button, Empty, Flex, Tabs, Popconfirm, App } from "antd";
import { EyeOutlined, CalendarOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetNewsQuery, useGetMyNewsQuery, useDeleteNewsMutation } from "@services/api/news.api";
import { useGetNPOByIdQuery } from "@services/api/npo.api";
import type { INews } from "@app-types/news.types";
import { useCity } from "@hooks/useCity";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";

const { Title } = Typography;

const NewsListPage = () => {
    const navigate = useNavigate();
    const { currentCity } = useCity();
    const [activeTab, setActiveTab] = useState("all");
    const { data: allNews, isLoading: isLoadingAll } = useGetNewsQuery(currentCity);
    const { data: myNews, isLoading: isLoadingMy } = useGetMyNewsQuery(undefined, { skip: activeTab !== "my" });
    const [deleteNews] = useDeleteNewsMutation();
    const { message } = App.useApp();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);
    const isNPO = isAuthenticated && userType === "npo";
    
    // Получаем данные НКО для проверки статуса
    const { data: npoData } = useGetNPOByIdQuery(isNPO && userId ? userId : skipToken);
    const isNPOConfirmed = isNPO && npoData?.status === "confirmed";
    // Волонтёры и админы могут создавать новости, НКО - только подтверждённые
    const canCreateNews = isAuthenticated && (!isNPO || isNPOConfirmed);
    
    const data = activeTab === "my" ? myNews : allNews;
    const isLoading = activeTab === "my" ? isLoadingMy : isLoadingAll;

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

    const handleDelete = async (newsId: number, newsName: string) => {
        try {
            await deleteNews(newsId).unwrap();
            message.success("Новость успешно удалена");
        } catch (error) {
            message.error("Ошибка при удалении новости");
        }
    };

    const renderNewsItem = (item: INews) => {
        const isMyNews = activeTab === "my";
        const actions = [
            <FavoriteButton
                key="favorite"
                itemType="news"
                itemId={item.id}
                size="small"
            />,
        ];

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
                    onConfirm={() => handleDelete(item.id, item.name)}
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
                        <Space>
                            <Title level={4} style={{ margin: 0 }}>
                                {item.name}
                            </Title>
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
                        Новости
                    </Title>
                    {canCreateNews && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/news/edit")}
                        >
                            Создать новость
                        </Button>
                    )}
                </Flex>
                {isAuthenticated && (
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: "all",
                                label: "Все новости",
                            },
                            {
                                key: "my",
                                label: "Мои новости",
                            },
                        ]}
                        style={{ marginBottom: 24 }}
                    />
                )}
                {isLoading ? (
                    <List loading={isLoading} />
                ) : !data || data.length === 0 ? (
                    <Empty description={activeTab === "my" ? "У вас пока нет новостей" : "Новостей пока нет"} />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={data}
                        renderItem={renderNewsItem}
                    />
                )}
            </Card>
        </div>
    );
};

export default NewsListPage;
