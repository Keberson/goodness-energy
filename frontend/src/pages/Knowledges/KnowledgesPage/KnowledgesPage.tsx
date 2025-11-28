import { useState } from "react";
import {
    Card,
    List,
    Typography,
    Tag,
    Space,
    Button,
    App,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Flex,
} from "antd";
import {
    DownloadOutlined,
    EyeOutlined,
    DeleteOutlined,
    EditOutlined,
    UploadOutlined,
    VideoCameraOutlined,
    MinusCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useNavigate } from "react-router-dom";

import type { IKnowledge } from "@app-types/knowledges.types";

import {
    useGetKnowledgesQuery,
    useDeleteKnowledgeMutation,
    useUpdateKnowledgeMutation,
} from "@services/api/knowledges.api";
import { useUploadFileMutation } from "@services/api/files.api";
import { getApiBaseUrl } from "@utils/apiUrl";
import useAppSelector from "@hooks/useAppSelector";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const KnowledgesPage = () => {
    const navigate = useNavigate();
    const { notification, modal } = App.useApp();
    const { data } = useGetKnowledgesQuery();
    const [deleteKnowledge] = useDeleteKnowledgeMutation();
    const [updateKnowledge] = useUpdateKnowledgeMutation();
    const [uploadFile] = useUploadFileMutation();
    const userType = useAppSelector((state) => state.auth.userType);
    const isAdmin = userType === "admin";

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingKnowledge, setEditingKnowledge] = useState<IKnowledge | null>(null);
    const [editForm] = Form.useForm();
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleDownload = async (item: IKnowledge, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation(); // Предотвращаем переход по ссылке
        }

        if (!item.attachedIds || item.attachedIds.length === 0) {
            notification.warning({
                message: "Нет файлов",
                description: "У этого материала нет прикрепленных файлов.",
            });
            return;
        }

        try {
            const token = localStorage.getItem("jwtToken");
            const headers: HeadersInit = {};
            if (token) {
                headers["authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${getApiBaseUrl()}/knowledges/${item.id}/download`, {
                method: "GET",
                headers,
            });

            if (!response.ok) {
                throw new Error("Не удалось скачать файлы");
            }

            // Получаем имя файла из заголовка Content-Disposition
            const contentDisposition = response.headers.get("content-disposition");
            let filename = `knowledge_${item.id}_files.zip`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(
                    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
                );
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

    const handleView = (item: IKnowledge) => {
        navigate(`${item.id}`);
    };

    const handleEdit = (item: IKnowledge, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setEditingKnowledge(item);
        setEditModalVisible(true);
        setNewFiles([]);

        // Заполняем форму текущими данными
        editForm.setFieldsValue({
            title: item.name,
            description: item.text,
            videoLinks: item.links && item.links.length > 0 ? item.links : [""],
            tags: item.tags && item.tags.length > 0 ? item.tags.join(", ") : "",
        });
    };

    const handleEditCancel = () => {
        setEditModalVisible(false);
        setEditingKnowledge(null);
        setNewFiles([]);
        editForm.resetFields();
    };

    const handleEditSubmit = async () => {
        if (!editingKnowledge) return;

        try {
            const values = await editForm.validateFields();
            setUploading(true);

            // Загружаем новые файлы
            const newFileIds: number[] = [];
            for (const file of newFiles) {
                try {
                    const result = await uploadFile(file).unwrap();
                    newFileIds.push(result.id);
                } catch (error) {
                    message.error(`Ошибка при загрузке файла ${file.name}`);
                    setUploading(false);
                    return;
                }
            }

            // Объединяем существующие файлы с новыми
            const allFileIds = [...(editingKnowledge.attachedIds || []), ...newFileIds];

            // Обрабатываем теги
            const tags = values.tags
                ? values.tags
                      .split(",")
                      .map((tag: string) => tag.trim())
                      .filter((tag: string) => tag.length > 0)
                : editingKnowledge.tags;

            // Обновляем материал
            const updateData: any = {
                id: editingKnowledge.id,
                name: values.title,
                text: values.description,
                tags: tags,
                links: values.videoLinks?.filter((link: string) => link && link.trim()) || [],
            };

            // Если есть новые файлы, добавляем их к существующим
            if (newFileIds.length > 0) {
                updateData.attachedIds = allFileIds;
            } else {
                // Если новых файлов нет, сохраняем текущий список файлов
                updateData.attachedIds = editingKnowledge.attachedIds || [];
            }

            await updateKnowledge(updateData).unwrap();

            notification.success({
                message: "Материал обновлен",
                description: `Материал "${values.title}" был успешно обновлен.`,
            });

            handleEditCancel();
        } catch (error) {
            notification.error({
                message: "Ошибка",
                description: "Не удалось обновить материал. Попробуйте еще раз.",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (file: File) => {
        const allowedFileTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "video/mp4",
            "video/avi",
            "video/quicktime",
        ];

        if (!allowedFileTypes.includes(file.type)) {
            message.error(
                `Файл "${file.name}" имеет неподдерживаемый тип. Разрешены: изображения (JPG, PNG, GIF, WEBP), документы (PDF, DOC, DOCX, TXT), видео (MP4, AVI, MOV)`
            );
            return false;
        }

        setNewFiles((prev) => [...prev, file]);
        return false;
    };

    const handleRemoveFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadProps: UploadProps = {
        beforeUpload: handleFileSelect,
        showUploadList: false,
        multiple: true,
        accept: ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov",
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
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 0 }}>
                        База знаний
                    </Title>
                    {isAdmin && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/knowledges/create")}
                        >
                            Создать материал
                        </Button>
                    )}
                </Flex>

                <List
                    itemLayout="vertical"
                    dataSource={data}
                    renderItem={(item) => {
                        const actions = [
                            <Button
                                key="view"
                                type="link"
                                icon={<EyeOutlined />}
                                onClick={() => handleView(item)}
                            >
                                Читать
                            </Button>,
                        ];

                        if (item.attachedIds && item.attachedIds.length > 0) {
                            actions.push(
                                <Button
                                    key="download"
                                    type="link"
                                    icon={<DownloadOutlined />}
                                    onClick={(e) => handleDownload(item, e)}
                                >
                                    Скачать ({item.attachedIds.length})
                                </Button>
                            );
                        }

                        if (isAdmin) {
                            actions.push(
                                <Button
                                    key="edit"
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={(e) => handleEdit(item, e)}
                                >
                                    Редактировать
                                </Button>,
                                <Button
                                    key="delete"
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => handleDelete(item, e)}
                                >
                                    Удалить
                                </Button>
                            );
                        }

                        return (
                            <List.Item key={item.id} actions={actions}>
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
                                    // Description intentionally omitted — text may contain HTML tags, we show full content on detail page
                                />

                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        Добавлено:{" "}
                                        {new Date(item.created_at).toLocaleDateString("ru-RU")}
                                    </Text>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Card>

            <Modal
                title="Редактировать материал"
                open={editModalVisible}
                onCancel={handleEditCancel}
                onOk={handleEditSubmit}
                confirmLoading={uploading}
                width={800}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    initialValues={{ title: "", description: "", videoLinks: [""], tags: "" }}
                >
                    <Form.Item
                        name="title"
                        label="Заголовок"
                        rules={[{ required: true, message: "Пожалуйста, введите заголовок!" }]}
                    >
                        <Input placeholder="Заголовок материала" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Описание"
                        rules={[{ required: true, message: "Пожалуйста, введите описание!" }]}
                    >
                        <TextArea rows={4} placeholder="Подробное описание материала" />
                    </Form.Item>

                    <Form.Item name="tags" label="Теги (через запятую)">
                        <Input placeholder="Введите теги через запятую" />
                    </Form.Item>

                    <Form.List name="videoLinks">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{ display: "flex", marginBottom: 8, width: "100%" }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            name={name}
                                            style={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Input
                                                prefix={<VideoCameraOutlined />}
                                                placeholder="Ссылка на RuTube и т.д."
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined
                                            onClick={() => remove(name)}
                                            style={{ marginLeft: 8, cursor: "pointer" }}
                                        />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add("")}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        Добавить ссылку на видео
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item label="Добавить новые файлы">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
                        </Upload>
                        <div style={{ marginTop: 16 }}>
                            {newFiles.map((file, index) => (
                                <Tag key={index} closable onClose={() => handleRemoveFile(index)}>
                                    {file.name}
                                </Tag>
                            ))}
                        </div>
                        {editingKnowledge &&
                            editingKnowledge.attachedIds &&
                            editingKnowledge.attachedIds.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        Текущие файлы: {editingKnowledge.attachedIds.length} шт.
                                        (новые файлы будут добавлены к существующим)
                                    </Text>
                                </div>
                            )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default KnowledgesPage;
