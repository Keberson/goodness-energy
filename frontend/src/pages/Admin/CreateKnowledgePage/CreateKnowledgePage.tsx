import { useState } from "react";
import {
    Card,
    Typography,
    Form,
    Input,
    Button,
    Upload,
    message,
    Space,
    Tag,
    Tooltip,
    App,
} from "antd";
import {
    UploadOutlined,
    VideoCameraOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    InfoCircleOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useUploadFileMutation } from "@services/api/files.api";
import { useCreateKnowledgeMutation } from "@services/api/knowledges.api";
import { Link, useNavigate } from "react-router-dom";

import "./styles.scss";

const { Title } = Typography;
const { TextArea } = Input;

const CreateKnowledgePage = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const [form] = Form.useForm();
    const [uploadFile] = useUploadFileMutation();
    const [createKnowledge] = useCreateKnowledgeMutation();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setUploading(true);

            // Загружаем все файлы на сервер
            const fileIds: number[] = [];
            for (const file of files) {
                try {
                    const result = await uploadFile(file).unwrap();
                    fileIds.push(result.id);
                } catch (error) {
                    message.error(`Ошибка при загрузке файла ${file.name}`);
                    setUploading(false);
                    return;
                }
            }

            // Отправляем форму с данными и ID файлов
            const knowledgeData = {
                name: values.title,
                text: values.description,
                attachedIds: fileIds.length > 0 ? fileIds : undefined,
                links:
                    values.videoLinks?.filter((link: string) => link && link.trim()) || undefined,
            };

            const result = await createKnowledge(knowledgeData).unwrap();

            console.log("Created knowledge result:", result);

            // Показываем уведомление со ссылкой на созданный материал
            if (result && result.id) {
                notification.success({
                    message: "Материал успешно создан!",
                    description: (
                        <span>
                            Материал "{result.name}" был успешно создан.{" "}
                            <Link
                                to={`/knowledges/${result.id}`}
                                style={{
                                    textDecoration: "underline",
                                    color: "#1890ff",
                                    fontWeight: 500,
                                }}
                            >
                                Перейти к материалу
                            </Link>
                        </span>
                    ),
                    duration: 5,
                    placement: "topRight",
                });
            } else {
                message.success("Материал успешно создан!");
            }

            form.resetFields();
            setFiles([]);
        } catch (error) {
            message.error("Ошибка при создании материала");
        } finally {
            setUploading(false);
        }
    };

    // Разрешенные типы файлов
    const allowedFileTypes = [
        // Изображения
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        // Документы
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        // Видео
        "video/mp4",
        "video/avi",
        "video/quicktime",
    ];

    const handleFileSelect = (file: File) => {
        // Проверяем тип файла
        if (!allowedFileTypes.includes(file.type)) {
            message.error(
                `Файл "${file.name}" имеет неподдерживаемый тип. Разрешены: изображения (JPG, PNG, GIF, WEBP), документы (PDF, DOC, DOCX, TXT), видео (MP4, AVI, MOV)`
            );
            return false; // Отклоняем файл
        }

        setFiles((prev) => [...prev, file]);
        return false; // Предотвращаем автоматическую загрузку
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadProps: UploadProps = {
        beforeUpload: handleFileSelect,
        showUploadList: false,
        multiple: true,
        accept: ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov",
    };

    return (
        <div className="create-knowledge-page">
            <Card>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/knowledges")}
                    style={{ marginBottom: 16, padding: 0 }}
                >
                    Назад к списку материалов
                </Button>
                <Title level={3}>Создать новый материал</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ title: "", description: "", videoLinks: [""], fileIds: [] }}
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
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Введите ссылку на видео",
                                                },
                                            ]}
                                            style={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Input
                                                prefix={<VideoCameraOutlined />}
                                                placeholder="Ссылка на RuTube и т.д."
                                                className="full-width-input"
                                                suffix={
                                                    <Tooltip
                                                        title="Публичные видео с RuTube будут встроены в страницу. Ссылки на VK Видео не могут быть обработаны и будут предложены как внешняя ссылка."
                                                        placement="topLeft"
                                                    >
                                                        <InfoCircleOutlined
                                                            style={{ cursor: "help" }}
                                                        />
                                                    </Tooltip>
                                                }
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

                    <Form.Item label="Загрузить файлы">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
                        </Upload>
                        <div style={{ marginTop: 16 }}>
                            {files.map((file, index) => (
                                <Tag key={index} closable onClose={() => handleRemoveFile(index)}>
                                    {file.name}
                                </Tag>
                            ))}
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={uploading}>
                            Создать материал
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateKnowledgePage;
