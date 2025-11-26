import { Card, List, Typography, Tag, Space, Button, Empty, Flex } from "antd";
import { EyeOutlined, CalendarOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetNewsQuery } from "@services/api/news.api";
import type { INews } from "@app-types/news.types";
import { useCity } from "@hooks/useCity";

const { Title } = Typography;

const NewsListPage = () => {
    const navigate = useNavigate();
    const { currentCity } = useCity();
    const { data, isLoading } = useGetNewsQuery(currentCity);

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

    return (
        <div style={{ padding: 24, minHeight: "calc(100vh - 48px)" }}>
            <Card style={{ minHeight: "calc(100vh - 96px)" }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ marginBottom: 0 }}>
                        Новости
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/news/edit")}
                    >
                        Создать новость
                    </Button>
                </Flex>
                {isLoading ? (
                    <List loading={isLoading} />
                ) : !data || data.length === 0 ? (
                    <Empty description="Новостей пока нет" />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={data}
                        renderItem={(item: INews) => (
                            <List.Item
                                key={item.id}
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/news/${item.id}`)}
                                    >
                                        Подробнее
                                    </Button>,
                                ]}
                            >
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
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default NewsListPage;
