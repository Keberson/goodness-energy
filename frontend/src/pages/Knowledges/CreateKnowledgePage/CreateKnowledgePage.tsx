import { useState } from "react";
import { Card, Typography, Form, Input, Button, Upload, message, Space } from "antd";
import { UploadOutlined, VideoCameraOutlined, FileOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

const CreateKnowledgePage = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log("Received values of form: ", values);
        message.success("Материал успешно создан!");
        form.resetFields();
    };

    const uploadProps: UploadProps = {
        name: "file",
        action: "/upload", // Здесь должен быть эндпоинт для загрузки файлов
        headers: {
            authorization: "authorization-text",
        },
        onChange(info) {
            if (info.file.status !== "uploading") {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === "done") {
                message.success(`${info.file.name} файл успешно загружен`);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} не удалось загрузить.`);
            }
        },
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

                    <Form.Item label="Загрузить файл">
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Нажмите для загрузки</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Создать материал
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateKnowledgePage;
