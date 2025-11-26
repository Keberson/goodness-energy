import { Card, Space, Typography } from "antd";
import {
    FontSizeOutlined,
    FileTextOutlined,
    PictureOutlined,
    UnorderedListOutlined,
    MutedOutlined,
    MinusOutlined,
    LinkOutlined,
    FileOutlined,
} from "@ant-design/icons";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { NewsEditorElementType } from "@app-types/news-editor.types";

const { Text } = Typography;

interface ToolbarItem {
    type: NewsEditorElementType;
    label: string;
    icon: React.ReactNode;
}

const toolbarItems: ToolbarItem[] = [
    { type: "heading", label: "Заголовок", icon: <FontSizeOutlined /> },
    { type: "paragraph", label: "Текст", icon: <FileTextOutlined /> },
    { type: "image", label: "Изображение", icon: <PictureOutlined /> },
    { type: "list", label: "Список", icon: <UnorderedListOutlined /> },
    { type: "quote", label: "Цитата", icon: <MutedOutlined /> },
    { type: "link", label: "Ссылка", icon: <LinkOutlined /> },
    { type: "file", label: "Документ", icon: <FileOutlined /> },
    { type: "divider", label: "Разделитель", icon: <MinusOutlined /> },
];

interface DraggableToolbarItemProps {
    item: ToolbarItem;
}

const DraggableToolbarItem = ({ item }: DraggableToolbarItemProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `toolbar-${item.type}`,
        data: {
            type: item.type,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1, // Полностью скрываем элемент при перетаскивании
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            <Card
                hoverable
                size="small"
                style={{
                    cursor: "grab",
                    marginBottom: 8,
                }}
                bodyStyle={{ padding: "12px" }}
            >
                <Space>
                    {item.icon}
                    <Text>{item.label}</Text>
                </Space>
            </Card>
        </div>
    );
};

const NewsToolbar = () => {
    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={5} style={{ marginBottom: 16 }}>
                Элементы
            </Typography.Title>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
                {toolbarItems.map((item) => (
                    <DraggableToolbarItem key={item.type} item={item} />
                ))}
            </Space>
        </div>
    );
};

export default NewsToolbar;
