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
        // Удаляем пустые строки в конце при сохранении, но сохраняем их во время редактирования
        const trimmedValue = [...editValue];
        // Удаляем пустые строки в конце
        while (trimmedValue.length > 0 && !trimmedValue[trimmedValue.length - 1]?.trim()) {
            trimmedValue.pop();
        }
        // Фильтруем пустые строки в середине (оставляем только непустые)
        const filteredValue = trimmedValue.filter((item) => item.trim());
        onSave(filteredValue.length > 0 ? filteredValue : [""]);
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
                    onChange={(e) => {
                        // Сохраняем все строки, включая пустые, чтобы можно было добавлять новые строки
                        const lines = e.target.value.split("\n");
                        setEditValue(lines);
                    }}
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

