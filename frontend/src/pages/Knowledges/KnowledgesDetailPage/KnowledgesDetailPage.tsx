import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Space, Tag, Carousel, Button, App, Flex } from "antd";
import { DeleteOutlined, ArrowLeftOutlined, DownloadOutlined } from "@ant-design/icons";

import "./styles.scss";

import { useGetKnowledgeByIdQuery, useDeleteKnowledgeMutation } from "@services/api/knowledges.api";
import useAppSelector from "@hooks/useAppSelector";

import FilePreview from "@components/FilePreview/FilePreview";
import VideoPlayer from "@components/VideoPlayer/VideoPlayer";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";

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

    const handleDownloadAllFiles = async () => {
        if (!id || !data || !data.attachedIds || data.attachedIds.length === 0) return;

        try {
            const token = localStorage.getItem("jwtToken");
            const headers: HeadersInit = {};
            if (token) {
                headers["authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/knowledges/${id}/download`,
                {
                    method: "GET",
                    headers,
                }
            );

            if (!response.ok) {
                throw new Error("Не удалось скачать файлы");
            }

            // Получаем имя файла из заголовка Content-Disposition
            const contentDisposition = response.headers.get("content-disposition");
            let filename = `knowledge_${id}_files.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, "");
                    // Декодируем UTF-8 имя файла если есть
                    const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
                    if (utf8Match) {
                        filename = decodeURIComponent(utf8Match[1]);
                    }
                }
            }

            // Создаем blob и скачиваем файл
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            notification.success({
                message: "Файлы скачаны",
                description: "Все файлы успешно скачаны.",
            });
        } catch (error) {
            notification.error({
                message: "Ошибка",
                description: "Не удалось скачать файлы. Попробуйте еще раз.",
            });
        }
    };

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card
                    extra={
                        <Flex gap={8}>
                            <FavoriteButton itemType="knowledge" itemId={data.id} />
                            {isAdmin && (
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                >
                                    Удалить материал
                                </Button>
                            )}
                        </Flex>
                    }
                >
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/knowledges")}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        Назад к списку материалов
                    </Button>
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
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                    <Title level={4} style={{ margin: 0 }}>Прикрепленные файлы</Title>
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownloadAllFiles}
                                    >
                                        Скачать все файлы {data.attachedIds.length > 1 ? `(${data.attachedIds.length})` : ""}
                                    </Button>
                                </div>
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
