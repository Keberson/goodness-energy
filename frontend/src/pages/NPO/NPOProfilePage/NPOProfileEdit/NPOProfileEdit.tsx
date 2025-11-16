import { useState, useEffect } from "react";
import { Button, Flex, Form, Upload, message, Row, Col } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

import type { INPO, INPOEdit } from "@app-types/npo.types";

import NPOForm from "@components/NPOForm/NPOForm";
import FilePreview from "@components/FilePreview/FilePreview";

import { useEditNPOMutation } from "@services/api/npo.api";
import { useUploadFileMutation } from "@services/api/files.api";

const { Dragger } = Upload;

interface NPOProfileEditProps {
    profileData: INPO;
    onCancel: () => void;
}

const NPOProfileEdit: React.FC<NPOProfileEditProps> = ({ profileData, onCancel }) => {
    const [editNPO] = useEditNPOMutation();
    const [uploadFile] = useUploadFileMutation();
    const [galleryIds, setGalleryIds] = useState<number[]>(profileData.galleryIds || []);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setGalleryIds(profileData.galleryIds || []);
    }, [profileData.galleryIds]);

    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);
            const result = await uploadFile(file).unwrap();
            setGalleryIds((prev) => [...prev, result.id]);
            message.success("Фотография успешно загружена");
            return false; // Предотвращаем автоматическую загрузку
        } catch (error) {
            message.error("Ошибка при загрузке фотографии");
            return false;
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = (fileId: number) => {
        setGalleryIds((prev) => prev.filter((id) => id !== fileId));
    };

    const handleSave = async (values: INPOEdit) => {
        const timetableValue = values.timetable?.trim();
        const body: any = {
            ...values,
            galleryIds: galleryIds,
            links: values.links.reduce<Record<string, string>>((acc, current, index) => {
                acc[`${current.type}-${index}`] = current.url;
                return acc;
            }, {}),
        };
        
        // Передаем timetable только если он не пустой
        if (timetableValue) {
            body.timetable = timetableValue;
        } else {
            body.timetable = null;
        }
        
        await editNPO({
            id: profileData.id,
            body,
        });
        onCancel();
    };

    const uploadProps = {
        beforeUpload: handleFileUpload,
        accept: "image/*",
        showUploadList: false,
        multiple: true,
    };

    // Преобразуем links из Record<string, string> в массив { type, url }
    const formInitialValues = {
        ...profileData,
        links: profileData.links
            ? Object.entries(profileData.links).map(([key, url]) => {
                  // Пытаемся извлечь тип из ключа (формат: "type-index")
                  const parts = key.split("-");
                  const type = parts[0] || "website";
                  return { type, url };
              })
            : [],
    };

    return (
        <Form layout="vertical" initialValues={formInitialValues} onFinish={handleSave}>
            <NPOForm />

            <Form.Item label="Галерея фотографий">
                <Dragger {...uploadProps} disabled={uploading}>
                    <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">Нажмите или перетащите файлы для загрузки</p>
                    <p className="ant-upload-hint">Поддерживаются форматы: JPG, PNG</p>
                </Dragger>

                {galleryIds.length > 0 && (
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        {galleryIds.map((fileId) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                <div style={{ position: "relative" }}>
                                    <FilePreview fileId={fileId} />
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                        }}
                                        onClick={() => handleRemovePhoto(fileId)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}
            </Form.Item>

            <Flex gap={8} justify="flex-end">
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" htmlType="submit" loading={uploading}>
                    Сохранить
                </Button>
            </Flex>
        </Form>
    );
};

export default NPOProfileEdit;

