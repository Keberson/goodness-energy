import { useState, useEffect } from "react";
import { Button, Space, Input, Card, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface QuoteElementProps {
    content: string;
    author?: string;
    isEditing: boolean;
    onSave: (content: string, props?: Record<string, any>) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const QuoteElement = ({ content, author = "", isEditing, onSave, onCancel, onEdit }: QuoteElementProps) => {
    const [editValue, setEditValue] = useState(content);
    const [authorValue, setAuthorValue] = useState(author);

    useEffect(() => {
        setEditValue(content);
        setAuthorValue(author);
    }, [content, author]);

    const handleSave = () => {
        onSave(editValue, { author: authorValue });
        onCancel();
    };

    const handleCancel = () => {
        setEditValue(content);
        setAuthorValue(author);
        onCancel();
    };

    if (isEditing) {
        return (
            <Space direction="vertical" style={{ width: "100%" }}>
                <TextArea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={3}
                    placeholder="Введите цитату"
                />
                <Input
                    value={authorValue}
                    onChange={(e) => setAuthorValue(e.target.value)}
                    placeholder="Автор цитаты (необязательно)"
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
        <Card
            style={{ borderLeft: "4px solid #1890ff", backgroundColor: "#f0f0f0", cursor: "pointer" }}
            onClick={onEdit}
        >
            <Text italic>"{content}"</Text>
            {author && (
                <div style={{ marginTop: 8, textAlign: "left" }}>
                    <Text type="secondary">— {author}</Text>
                </div>
            )}
        </Card>
    );
};

export default QuoteElement;

