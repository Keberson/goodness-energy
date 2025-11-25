import { useState, useEffect } from "react";
import { Button, Space, Input, List } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface ListElementProps {
    content: string[];
    isEditing: boolean;
    onSave: (content: string[]) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const ListElement = ({ content, isEditing, onSave, onCancel, onEdit }: ListElementProps) => {
    const [editValue, setEditValue] = useState<string[]>(content);

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
                    value={editValue.join("\n")}
                    onChange={(e) => setEditValue(e.target.value.split("\n").filter((item) => item.trim()))}
                    rows={4}
                    placeholder="Введите элементы списка (каждый с новой строки)"
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
            <List
                dataSource={content}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                size="small"
            />
        </div>
    );
};

export default ListElement;

