import { useState, useEffect } from "react";
import { Button, Space, Input, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface LinkElementProps {
    content: string;
    url?: string;
    isEditing: boolean;
    onSave: (content: string, props?: Record<string, any>) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const LinkElement = ({ content, url = "", isEditing, onSave, onCancel, onEdit }: LinkElementProps) => {
    const [editValue, setEditValue] = useState(content);
    const [linkUrl, setLinkUrl] = useState(url);

    useEffect(() => {
        setEditValue(content);
        setLinkUrl(url);
    }, [content, url]);

    const handleSave = () => {
        onSave(editValue, { url: linkUrl });
        onCancel();
    };

    const handleCancel = () => {
        setEditValue(content);
        setLinkUrl(url);
        onCancel();
    };

    if (isEditing) {
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Текст ссылки"
                />
                <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="URL ссылки (https://...)"
                />
                <Space>
                    <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} size="small">
                        Сохранить
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={handleCancel} size="small">
                        Отмена
                    </Button>
                </Space>
            </Space>
        );
    }

    return (
        <div onClick={onEdit} style={{ cursor: "pointer" }}>
            {url ? (
                <Typography.Link href={url} target="_blank" rel="noopener noreferrer">
                    {content || url}
                </Typography.Link>
            ) : (
                <Text type="secondary">{content || "Ссылка не настроена"}</Text>
            )}
        </div>
    );
};

export default LinkElement;

