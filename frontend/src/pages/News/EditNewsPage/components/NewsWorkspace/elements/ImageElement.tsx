import { useState, useEffect } from "react";
import { Button, Space, Input, Typography, Card, Upload, App, Carousel } from "antd";
import { CheckOutlined, CloseOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import FilePreview from "@components/FilePreview/FilePreview";
import { useUploadFileMutation } from "@services/api/files.api";

interface ImageElementProps {
    content: number | number[];
    caption?: string;
    isEditing: boolean;
    onSave: (content: number | number[], props?: Record<string, any>) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const ImageElement = ({ content, caption = "", isEditing, onSave, onCancel, onEdit }: ImageElementProps) => {
    const [captionValue, setCaptionValue] = useState(caption);
    const [uploading, setUploading] = useState(false);
    const [uploadFile] = useUploadFileMutation();
    const { message } = App.useApp();

    useEffect(() => {
        setCaptionValue(caption);
    }, [caption]);

    const getImageIds = (): number[] => {
        if (Array.isArray(content)) {
            return content
                .map((id) => (typeof id === "number" ? id : parseInt(String(id))))
                .filter((id) => !isNaN(id) && id > 0);
        }
        if (typeof content === "number" && content > 0) {
            return [content];
        }
        return [];
    };

    const imageIds = getImageIds();

    const handleImageUpload: UploadProps["beforeUpload"] = async (file) => {
        if (!file.type.startsWith("image/")) {
            message.error("Пожалуйста, выберите файл изображения");
            return false;
        }
        try {
            setUploading(true);
            const result = await uploadFile(file).unwrap();
            const currentIds = getImageIds();
            const newIds = [...currentIds, result.id];
            onSave(newIds, { caption: captionValue });
            message.success("Изображение успешно загружено");
        } catch (error) {
            message.error("Ошибка при загрузке изображения");
        } finally {
            setUploading(false);
        }
        return false;
    };

    const handleRemoveImage = (fileIdToRemove: number) => {
        const currentIds = getImageIds();
        const newIds = currentIds.filter((id) => id !== fileIdToRemove);
        onSave(newIds.length > 0 ? newIds : 0, { caption: captionValue });
        message.success("Изображение удалено");
    };

    const handleSaveCaption = () => {
        onSave(imageIds.length > 0 ? imageIds : 0, { caption: captionValue });
        onCancel();
    };

    if (isEditing) {
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                {imageIds.length > 0 && (
                    <div>
                        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                            Загруженные изображения:
                        </Typography.Text>
                        <Space wrap>
                            {imageIds.map((fileId) => (
                                <Card
                                    key={fileId}
                                    size="small"
                                    style={{ width: 150, position: "relative" }}
                                    styles={{ body: { padding: 8 } }}
                                >
                                    <FilePreview fileId={fileId} />
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveImage(fileId)}
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            zIndex: 10,
                                        }}
                                    >
                                        Удалить
                                    </Button>
                                </Card>
                            ))}
                        </Space>
                    </div>
                )}
                <Upload
                    beforeUpload={handleImageUpload}
                    showUploadList={false}
                    accept="image/*"
                    multiple
                >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                        {imageIds.length > 0 ? "Добавить изображения" : "Загрузить изображения"}
                    </Button>
                </Upload>
                <div style={{ width: "100%" }}>
                    <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
                        Подпись к изображению:
                    </Typography.Text>
                    <Input
                        value={captionValue}
                        onChange={(e) => setCaptionValue(e.target.value)}
                        placeholder="Введите подпись к изображению (необязательно)"
                    />
                </div>
                <Space>
                    <Button type="primary" icon={<CheckOutlined />} onClick={handleSaveCaption} size="small">
                        Сохранить
                    </Button>
                    <Button
                        icon={<CloseOutlined />}
                        onClick={() => {
                            setCaptionValue(caption);
                            onCancel();
                        }}
                        size="small"
                    >
                        Отмена
                    </Button>
                </Space>
            </Space>
        );
    }

    // Отображение изображений
    if (imageIds.length === 0) {
        return (
            <Typography.Text type="secondary" onClick={onEdit} style={{ cursor: "pointer" }}>
                Изображения не загружены
            </Typography.Text>
        );
    }

    if (imageIds.length === 1) {
        return (
            <div onClick={onEdit} style={{ cursor: "pointer" }}>
                <FilePreview fileId={imageIds[0]} />
                {caption && (
                    <Typography.Text
                        type="secondary"
                        style={{ display: "block", marginTop: 8, textAlign: "center" }}
                    >
                        {caption}
                    </Typography.Text>
                )}
            </div>
        );
    }

    // Несколько изображений - слайдер
    return (
        <div onClick={onEdit} style={{ cursor: "pointer" }}>
            <Carousel dots arrows style={{ maxWidth: 800, margin: "0 auto" }}>
                {imageIds.map((fileId) => (
                    <div key={fileId}>
                        <FilePreview fileId={fileId} />
                    </div>
                ))}
            </Carousel>
            {caption && (
                <Typography.Text
                    type="secondary"
                    style={{ display: "block", marginTop: 8, textAlign: "center" }}
                >
                    {caption}
                </Typography.Text>
            )}
        </div>
    );
};

export default ImageElement;

