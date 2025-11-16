import { Card, List, Typography, Tag, Space, Button } from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { IKnowledge } from "@app-types/knowledges.types";

import { useGetKnowledgesQuery } from "@services/api/knowledges.api";

const { Title, Paragraph, Text } = Typography;

const KnowledgesPage = () => {
    const navigate = useNavigate();
    const { data } = useGetKnowledgesQuery();

    const handleDownload = (item: IKnowledge) => {
        console.log("Download:", item);
        // Логика скачивания файлов
    };

    const handleView = (item: IKnowledge) => {
        navigate(`${item.id}`);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Title level={2} style={{ marginBottom: 24 }}>
                    База знаний
                </Title>

                <List
                    itemLayout="vertical"
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item
                            key={item.id}
                            actions={[
                                <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleView(item)}
                                >
                                    Читать
                                </Button>,
                                item.attachedIds && item.attachedIds.length > 0 && (
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownload(item)}
                                    >
                                        Скачать ({item.attachedIds.length})
                                    </Button>
                                ),
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space direction="vertical" size={4}>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {item.name}
                                        </Title>
                                        <Space wrap>
                                            {item.tags.map((tag) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </Space>
                                    </Space>
                                }
                                description={
                                    <Paragraph
                                        style={{ marginBottom: 0 }}
                                        ellipsis={{ rows: 2, expandable: "collapsible" }}
                                    >
                                        {item.text}
                                    </Paragraph>
                                }
                            />

                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">
                                    Добавлено:{" "}
                                    {new Date(item.created_at).toLocaleDateString("ru-RU")}
                                </Text>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default KnowledgesPage;
