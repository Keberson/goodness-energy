import { useState, useEffect } from "react";
import { Button, Space, Input, Card, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface QuoteElementProps {
    content: string;
    isEditing: boolean;
    onSave: (content: string) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const QuoteElement = ({ content, isEditing, onSave, onCancel, onEdit }: QuoteElementProps) => {
    const [editValue, setEditValue] = useState(content);

    useEffect(() => {
        setEditValue(content);
    }, [content]);

    const handleSave = () => {
        onSave(editValue);
        onCancel();
    };

    const handleCancel = () => {
        setEditValue(content);
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
        </Card>
    );
};

export default QuoteElement;

