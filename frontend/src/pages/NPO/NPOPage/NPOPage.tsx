import { Card, Tabs, Typography, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";

import NPODetails from "./NPODetails/NPODetails";
import NewsContent from "@components/NewsContent/NewsContent";

import { useGetNPOByIdQuery, useRegisterNPOViewMutation, useGetNPONewsQuery } from "@services/api/npo.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NPOPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const npoId = Number(id!);
    const { data, isLoading } = useGetNPOByIdQuery(npoId);
    const [registerView] = useRegisterNPOViewMutation();
    
    // Проверяем наличие кастомной страницы
    // Отладочная информация для диагностики
    if (data) {
        console.log("NPOPage data:", {
            hasPageContent: 'page_content' in data,
            pageContentType: typeof data.page_content,
            pageContentValue: data.page_content,
            pageContentLength: data.page_content?.length,
        });
    }
    
    const hasCustomPage = data?.page_content && typeof data.page_content === 'string' && data.page_content.trim().length > 0;
    
    const { data: newsList = [] } = useGetNPONewsQuery(npoId, {
        skip: !npoId || !hasCustomPage,
    });

    useEffect(() => {
        if (npoId) {
            // Регистрируем просмотр профиля НКО
            registerView(npoId).catch(() => {
                // Игнорируем ошибки при регистрации просмотра
            });
        }
    }, [npoId, registerView]);

    // Показываем загрузку
    if (isLoading) {
        return (
            <div style={{ padding: 24 }}>
                <Card loading={true} />
            </div>
        );
    }

    // Если нет данных, показываем ошибку
    if (!data) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Title level={3}>НКО не найдена</Title>
                </Card>
            </div>
        );
    }

    // Если есть кастомная страница (page_content), показываем её как страницу с новостями
    if (hasCustomPage) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/npo")}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        Назад к списку НКО
                    </Button>
                    <Title level={2} style={{ marginBottom: 24 }}>
                        {data.name}
                    </Title>

                    <Tabs defaultActiveKey="page">
                        <TabPane tab="Страница" key="page">
                            <NewsContent
                                html={data.page_content || ""}
                                className="npo-page-content"
                                style={{
                                    fontSize: 16,
                                    lineHeight: 1.8,
                                }}
                            />
                        </TabPane>
                        {newsList.length > 0 && (
                            <TabPane tab="Новости" key="news">
                                <div>
                                    {newsList.map((news) => (
                                        <Card key={news.id} style={{ marginBottom: 16 }}>
                                            <Title level={4}>{news.name}</Title>
                                            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                                                Автор: {news.author}
                                            </Text>
                                            {news.annotation && (
                                                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                                                    {news.annotation}
                                                </Text>
                                            )}
                                            <NewsContent
                                                html={news.text}
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1.6,
                                                }}
                                            />
                                        </Card>
                                    ))}
                                </div>
                            </TabPane>
                        )}
                        <TabPane tab="Галерея" key="gallery">
                            <NPODetails npo={data} showGallery />
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        );
    }

    // По умолчанию показываем стандартный шаблон
    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/npo")}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        Назад к списку НКО
                    </Button>
                    <Title level={2} style={{ marginBottom: 24 }}>
                        {data.name}
                    </Title>

                    <Tabs defaultActiveKey="info">
                        <TabPane tab="Информация" key="info">
                            <NPODetails npo={data} />
                        </TabPane>
                        <TabPane tab="Галерея" key="gallery">
                            <NPODetails npo={data} showGallery />
                        </TabPane>
                    </Tabs>
                </Card>
            )}
        </div>
    );
};

export default NPOPage;
