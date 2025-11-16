import { useParams } from "react-router-dom";
import { Card, Typography, Space, Tag, Carousel } from "antd";

import "./styles.scss";

import { useGetKnowledgeByIdQuery } from "@services/api/knowledges.api";

import FilePreview from "@components/FilePreview/FilePreview";
import VideoPlayer from "@components/VideoPlayer/VideoPlayer";

const { Title, Paragraph, Text } = Typography;

const KnowledgeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { data } = useGetKnowledgeByIdQuery(Number(id!));

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card>
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <div>
                            <Title level={2}>{data.name}</Title>
                            <Space wrap>
                                {data.tags.map((tag) => (
                                    <Tag key={tag} color="blue">
                                        {tag}
                                    </Tag>
                                ))}
                            </Space>
                        </div>

                        <div>
                            <Title level={4}>Описание</Title>
                            <Paragraph style={{ fontSize: "16px", lineHeight: 1.6 }}>
                                {data.text}
                            </Paragraph>
                        </div>

                        <div>
                            <Text type="secondary">
                                Дата создания:{" "}
                                {new Date(data.created_at).toLocaleDateString("ru-RU")}
                            </Text>
                        </div>

                        {data.attachedIds && data.attachedIds.length > 0 && (
                            <div>
                                <Title level={4}>Прикрепленные файлы</Title>
                                <Carousel
                                    dots={false}
                                    arrows
                                    style={{ maxWidth: 800, margin: "0 auto" }}
                                >
                                    {data.attachedIds.map((fileId) => (
                                        <div key={fileId}>
                                            <FilePreview fileId={fileId} />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                        )}

                        {data.links && data.links.length > 0 && (
                            <div>
                                <Title level={4}>Видео материал</Title>
                                <Carousel
                                    dots={false}
                                    arrows
                                    style={{ maxWidth: 600, margin: "0 auto" }}
                                >
                                    {data.links.map((link) => (
                                        <VideoPlayer videoUrl={link} />
                                    ))}
                                </Carousel>
                            </div>
                        )}
                    </Space>
                </Card>
            )}
        </div>
    );
};

export default KnowledgeDetailPage;
