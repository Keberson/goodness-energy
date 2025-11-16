import { Card, List, Typography, Tag, Space, Button, App } from "antd";
import { DownloadOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { IKnowledge } from "@app-types/knowledges.types";

import { useGetKnowledgesQuery, useDeleteKnowledgeMutation } from "@services/api/knowledges.api";
import useAppSelector from "@hooks/useAppSelector";

const { Title, Paragraph, Text } = Typography;

const KnowledgesPage = () => {
    const navigate = useNavigate();
    const { notification, modal } = App.useApp();
    const { data } = useGetKnowledgesQuery();
    const [deleteKnowledge] = useDeleteKnowledgeMutation();
    const userType = useAppSelector((state) => state.auth.userType);
    const isAdmin = userType === "admin";

    const handleDownload = (item: IKnowledge) => {
        console.log("Download:", item);
        // Логика скачивания файлов
    };

    const handleView = (item: IKnowledge) => {
        navigate(`${item.id}`);
    };

    const handleDelete = (item: IKnowledge, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход по ссылке

        modal.confirm({
            title: "Удаление материала",
            content: `Вы уверены, что хотите удалить материал "${item.name}"? Это действие нельзя отменить.`,
            okText: "Удалить",
            okType: "danger",
            cancelText: "Отмена",
            centered: true,
            onOk: async () => {
                try {
                    await deleteKnowledge(item.id).unwrap();
                    notification.success({
                        message: "Материал удален",
                        description: `Материал "${item.name}" был успешно удален.`,
                    });
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
                                    key="view"
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleView(item)}
                                >
                                    Читать
                                </Button>,
                                item.attachedIds && item.attachedIds.length > 0 && (
                                    <Button
                                        key="download"
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownload(item)}
                                    >
                                        Скачать ({item.attachedIds.length})
                                    </Button>
                                ),
                                isAdmin && (
                                    <Button
                                        key="delete"
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={(e) => handleDelete(item, e)}
                                    >
                                        Удалить
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
