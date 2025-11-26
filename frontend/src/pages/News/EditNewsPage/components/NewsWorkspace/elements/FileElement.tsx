import { useState } from "react";
import { Button, Space, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import FilePreview from "@components/FilePreview/FilePreview";
import { useUploadFileMutation } from "@services/api/files.api";

interface FileElementProps {
    content: number;
    isEditing: boolean;
    onSave: (content: number, props?: Record<string, any>) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const FileElement = ({ content, isEditing, onSave, onCancel, onEdit }: FileElementProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadFile] = useUploadFileMutation();
    const { message } = App.useApp();

    const handleFileUpload: UploadProps["beforeUpload"] = async (file) => {
        try {
            setUploading(true);
            const result = await uploadFile(file).unwrap();
            onSave(result.id, {});
            message.success("Файл успешно загружен");
            onCancel();
        } catch (error) {
            message.error("Ошибка при загрузке файла");
        } finally {
            setUploading(false);
        }
        return false;
    };

    const documentFileId = typeof content === "number" ? content : parseInt(String(content));

    if (isEditing || !documentFileId || documentFileId === 0) {
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <Upload
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                >
                    <Button icon={<UploadOutlined />} loading={uploading}>
                        {documentFileId && documentFileId > 0 ? "Заменить файл" : "Загрузить файл"}
                    </Button>
                </Upload>
            </Space>
        );
    }

    return (
        <div onClick={onEdit} style={{ cursor: "pointer" }}>
            <FilePreview fileId={documentFileId} />
        </div>
    );
};

export default FileElement;

