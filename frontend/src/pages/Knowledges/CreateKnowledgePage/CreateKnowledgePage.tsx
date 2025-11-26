import { useState } from "react";
import { Card, Typography, Form, Input, Button, Upload, App, Tag, Space } from "antd";
import { UploadOutlined, VideoCameraOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useUploadFileMutation } from "@services/api/files.api";
import { useCreateKnowledgeMutation } from "@services/api/knowledges.api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { TextArea } = Input;

const CreateKnowledgePage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [uploadFile] = useUploadFileMutation();
    const [createKnowledge] = useCreateKnowledgeMutation();
    const { message } = App.useApp();
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
                links: values.videoLink ? [values.videoLink] : undefined,
            };

            const result = await createKnowledge(knowledgeData).unwrap();
            message.success("Материал успешно создан!");
            form.resetFields();
            setFiles([]);
            navigate(`/knowledges/${result.id}`);
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
    ];

    const handleFileSelect = (file: File) => {
        // Проверяем тип файла
        if (!allowedFileTypes.includes(file.type)) {
            message.error(
                `Файл "${file.name}" имеет неподдерживаемый тип. Разрешены: изображения (JPG, PNG, GIF, WEBP), документы (PDF, DOC, DOCX, TXT)`
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
        accept: ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt",
    };

    return (
        <div className="create-knowledge-page">
            <Card>
                <Title level={3}>Создать новый материал</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ title: "", description: "", videoLink: "" }}
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

                    <Form.Item name="videoLink" label="Ссылка на видео">
                        <Input
                            prefix={<VideoCameraOutlined />}
                            placeholder="Ссылка на YouTube, Vimeo и т.д."
                        />
                    </Form.Item>

                    <Form.Item label="Загрузить файлы">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
                        </Upload>
                        {files.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Space wrap>
                                    {files.map((file, index) => (
                                        <Tag key={index} closable onClose={() => handleRemoveFile(index)}>
                                            {file.name}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        )}
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
