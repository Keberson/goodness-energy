import React from "react";
import { Button, Image, Typography } from "antd";
import { DownloadOutlined, FileWordOutlined, FileImageOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface FilePreviewProps {
    fileId: number;
    fileName?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileId, fileName }) => {
    const getFileType = (): "pdf" | "image" | "doc" | "other" => {
        if (!fileName) return "other";

        const ext = fileName.split(".").pop()?.toLowerCase();
        if (["pdf"].includes(ext || "")) return "pdf";
        if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
        if (["doc", "docx"].includes(ext || "")) return "doc";
        return "other";
    };

    const fileType = getFileType();
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/files/${fileId}`;

    const renderPreview = () => {
        switch (fileType) {
            case "pdf":
                return (
                    <div style={{ textAlign: "center" }}>
                        <iframe
                            src={fileUrl}
                            style={{
                                width: "100%",
                                height: "500px",
                                border: "1px solid #d9d9d9",
                                borderRadius: 8,
                            }}
                            title={`PDF: ${fileName}`}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text strong>{fileName}</Text>
                        </div>
                        <Button
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
                return (
                    <div style={{ textAlign: "center" }}>
                        <Image
                            src={fileUrl}
                            alt={fileName}
                            style={{ maxHeight: 400, maxWidth: "100%" }}
                            preview={{
                                mask: <div>Просмотр</div>,
                            }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">{fileName}</Text>
                        </div>
                    </div>
                );

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

    return (
        <div
            style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 16,
                background: "#fafafa",
            }}
        >
            {renderPreview()}
        </div>
    );
};

export default FilePreview;
