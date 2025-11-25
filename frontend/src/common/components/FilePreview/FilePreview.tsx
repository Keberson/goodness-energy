import React, { useState, useEffect, useRef } from "react";
import { Button, Image, Typography } from "antd";
import {
    DownloadOutlined,
    FileWordOutlined,
    FileImageOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";

import { useGetFileInfoQuery } from "@services/api/files.api";
import { getApiBaseUrl } from "@utils/apiUrl";

const { Text } = Typography;

interface FilePreviewProps {
    fileId: number;
}

// Компонент для отображения изображений с авторизацией
const ImagePreview: React.FC<{ fileId: number; fileUrl: string; fileName: string }> = ({
    fileId,
    fileUrl,
    fileName,
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const loadImage = async () => {
            try {
                setLoading(true);
                // Освобождаем предыдущий blob URL, если он есть
                if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = null;
                }

                const token = localStorage.getItem("jwtToken");
                const headers: HeadersInit = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const response = await fetch(fileUrl, { headers });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                blobUrlRef.current = blobUrl;
                setImageUrl(blobUrl);
                setError(null);
            } catch (err) {
                console.error("Ошибка загрузки изображения:", err);
                setError("Не удалось загрузить изображение");
            } finally {
                setLoading(false);
            }
        };

        loadImage();

        // Cleanup: освобождаем blob URL при размонтировании
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [fileId, fileUrl]);

    if (loading) {
        return (
            <div style={{ textAlign: "center", width: "100%", padding: 20 }}>
                <Text type="secondary">Загрузка изображения...</Text>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div style={{ textAlign: "center", width: "100%", padding: 20 }}>
                <Text type="danger">{error || "Не удалось загрузить изображение"}</Text>
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center", width: "100%" }}>
            <Image
                src={imageUrl}
                alt={fileName}
                style={{
                    maxHeight: 600,
                    maxWidth: "100%",
                    display: "block",
                    margin: "0 auto",
                }}
                preview={{
                    mask: <div>Просмотр</div>,
                }}
            />
            <div style={{ marginTop: 8 }}>
                <Text type="secondary">{fileName}</Text>
            </div>
        </div>
    );
};

const FilePreview: React.FC<FilePreviewProps> = ({ fileId }) => {
    const { data, isLoading, error } = useGetFileInfoQuery(fileId);

    const getFileType = (ext: string): "pdf" | "image" | "doc" | "xls" | "other" => {
        if (["pdf"].includes(ext || "")) return "pdf";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
        if (["doc", "docx"].includes(ext || "")) return "doc";
        if (["csv", "xlsx", "xls"].includes(ext || "")) return "xls";
        return "other";
    };

    const fileUrl = `${getApiBaseUrl()}/files/${fileId}`;

    const renderPreview = (fileType: string, fileName: string) => {
        switch (getFileType(fileType)) {
            case "pdf":
                return (
                    <div style={{ textAlign: "center", width: "100%" }}>
                        <object
                            data={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                            type="application/pdf"
                            style={{
                                width: "100%",
                                maxWidth: "800px",
                                height: "600px",
                                border: "1px solid #d9d9d9",
                                borderRadius: 8,
                                display: "block",
                                margin: "0 auto",
                            }}
                            title={`PDF: ${fileName}`}
                        >
                            <div style={{ padding: 20 }}>
                                <Text type="secondary">
                                    Не удалось загрузить PDF.{" "}
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        Открыть в новой вкладке
                                    </a>
                                </Text>
                            </div>
                        </object>
                        <div style={{ marginTop: 8 }}>
                            <Text strong>{fileName}</Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            href={fileUrl}
                            download
                            style={{ marginTop: 8 }}
                        >
                            Скачать PDF
                        </Button>
                    </div>
                );

            case "image":
                return <ImagePreview fileId={fileId} fileUrl={fileUrl} fileName={fileName} />;

            case "doc":
                return (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <FileWordOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                        <div style={{ marginTop: 8 }}>
                            <Text strong>{fileName}</Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            href={fileUrl}
                            style={{ marginTop: 16 }}
                        >
                            Скачать документ
                        </Button>
                    </div>
                );

            case "xls":
                return (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <FileExcelOutlined style={{ fontSize: 48, color: "#0fb317ff" }} />
                        <div style={{ marginTop: 8 }}>
                            <Text strong>{fileName}</Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            href={fileUrl}
                            style={{ marginTop: 16 }}
                        >
                            Скачать документ
                        </Button>
                    </div>
                );

            default:
                return (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <FileImageOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                        <div style={{ marginTop: 8 }}>
                            <Text strong>{fileName || `Файл ${fileId}`}</Text>
                        </div>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            href={fileUrl}
                            style={{ marginTop: 16 }}
                        >
                            Скачать файл
                        </Button>
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div
                style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 16,
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: 100,
                }}
            >
                <Text type="secondary">Загрузка...</Text>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div
                style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 16,
                    background: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: 100,
                }}
            >
                <Text type="danger">Ошибка загрузки файла</Text>
            </div>
        );
    }

    return (
        <div
            style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 16,
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "100%",
            }}
        >
            {renderPreview(data.file_type, data.filename)}
        </div>
    );
};

export default FilePreview;
