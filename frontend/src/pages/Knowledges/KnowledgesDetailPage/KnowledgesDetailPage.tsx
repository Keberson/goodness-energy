import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Space, Tag, Carousel, Button, App } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import "./styles.scss";

import { useGetKnowledgeByIdQuery, useDeleteKnowledgeMutation } from "@services/api/knowledges.api";
import useAppSelector from "@hooks/useAppSelector";

import FilePreview from "@components/FilePreview/FilePreview";
import VideoPlayer from "@components/VideoPlayer/VideoPlayer";

const { Title, Paragraph, Text } = Typography;

const KnowledgeDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { notification, modal } = App.useApp();
    const { data } = useGetKnowledgeByIdQuery(Number(id!));
    const [deleteKnowledge, { isLoading: isDeleting }] = useDeleteKnowledgeMutation();
    const userType = useAppSelector((state) => state.auth.userType);
    const isAdmin = userType === "admin";

    const handleDelete = () => {
        if (!id || !data) return;

        modal.confirm({
            title: "Удаление материала",
            content: `Вы уверены, что хотите удалить материал "${data.name}"? Это действие нельзя отменить.`,
            okText: "Удалить",
            okType: "danger",
            cancelText: "Отмена",
            centered: true,
            onOk: async () => {
                try {
                    await deleteKnowledge(Number(id)).unwrap();
                    notification.success({
                        message: "Материал удален",
                        description: `Материал "${data.name}" был успешно удален.`,
                    });
                    navigate("/knowledges");
                } catch (error) {
                    notification.error({
                        message: "Ошибка",
                        description: "Не удалось удалить материал. Попробуйте еще раз.",
                    });
                }
            },
        });
    };

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card
                    extra={
                        isAdmin && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                                loading={isDeleting}
                            >
                                Удалить материал
                            </Button>
                        )
                    }
                >
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
