import { useState, useEffect } from "react";
import { Input, Button, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

interface HeadingElementProps {
    content: string;
    level?: number;
    isEditing: boolean;
    onSave: (content: string, props?: Record<string, any>) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const HeadingElement = ({
    content,
    level = 2,
    isEditing,
    onSave,
    onCancel,
    onEdit,
}: HeadingElementProps) => {
    const [editValue, setEditValue] = useState(content);

    useEffect(() => {
        setEditValue(content);
    }, [content]);

    const handleSave = () => {
        onSave(editValue, { level });
        onCancel();
    };

    const handleCancel = () => {
        setEditValue(content);
        onCancel();
    };

    if (isEditing) {
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Введите заголовок"
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
        <Typography.Title level={level as 1 | 2 | 3 | 4 | 5} onClick={onEdit} style={{ cursor: "pointer" }}>
            {content}
        </Typography.Title>
    );
};

export default HeadingElement;

