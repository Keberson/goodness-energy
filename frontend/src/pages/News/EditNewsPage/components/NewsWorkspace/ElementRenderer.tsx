import { useState } from "react";
import { Card, Button } from "antd";
import { DeleteOutlined, EditOutlined, DragOutlined } from "@ant-design/icons";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { NewsEditorElement } from "@app-types/news-editor.types";
import HeadingElement from "./elements/HeadingElement";
import ParagraphElement from "./elements/ParagraphElement";
import ImageElement from "./elements/ImageElement";
import ListElement from "./elements/ListElement";
import QuoteElement from "./elements/QuoteElement";
import LinkElement from "./elements/LinkElement";
import FileElement from "./elements/FileElement";
import DividerElement from "./elements/DividerElement";

interface ElementRendererProps {
    element: NewsEditorElement;
    onUpdate: (content: string | string[] | number | number[], props?: Record<string, any>) => void;
    onDelete: () => void;
    activeId: string | null;
}

const ElementRenderer = ({ element, onUpdate, onDelete, activeId }: ElementRendererProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
    });

    // Используем useDroppable для визуальной обратной связи при перетаскивании элементов из тулбара
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: element.id,
    });

    // Показываем подсветку только если перетаскивается элемент из тулбара (новый элемент)
    const isDraggingFromToolbar = activeId?.toString().startsWith("toolbar-") ?? false;
    const shouldHighlight = isOver && !isDragging && isDraggingFromToolbar;

    // Объединяем refs
    const combinedRef = (node: HTMLElement | null) => {
        setNodeRef(node);
        setDroppableRef(node);
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSave = (
        content: string | string[] | number | number[],
        props?: Record<string, any>
    ) => {
        onUpdate(content, props);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const renderContent = () => {
        switch (element.type) {
            case "heading":
                return (
                    <HeadingElement
                        content={element.content as string}
                        level={(element.props?.level as number) || 2}
                        isEditing={isEditing}
                        onSave={(content, props) => handleSave(content, props)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "paragraph":
                return (
                    <ParagraphElement
                        content={element.content as string}
                        isEditing={isEditing}
                        onSave={(content) => handleSave(content)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "image":
                return (
                    <ImageElement
                        content={
                            Array.isArray(element.content)
                                ? element.content.map((item) => (typeof item === "number" ? item : parseInt(String(item)) || 0))
                                : typeof element.content === "number"
                                ? element.content
                                : 0
                        }
                        caption={(element.props?.caption as string) || ""}
                        isEditing={isEditing}
                        onSave={(content, props) => handleSave(content, props)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "list":
                return (
                    <ListElement
                        content={
                            Array.isArray(element.content)
                                ? element.content.map((item) => String(item))
                                : [String(element.content)]
                        }
                        isEditing={isEditing}
                        onSave={(content) => handleSave(content)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "quote":
                return (
                    <QuoteElement
                        content={element.content as string}
                        author={(element.props?.author as string) || ""}
                        isEditing={isEditing}
                        onSave={(content, props) => handleSave(content, props)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "link":
                return (
                    <LinkElement
                        content={element.content as string}
                        url={(element.props?.url as string) || ""}
                        isEditing={isEditing}
                        onSave={(content, props) => handleSave(content, props)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "file":
                return (
                    <FileElement
                        content={
                            typeof element.content === "number"
                                ? element.content
                                : parseInt(String(element.content))
                        }
                        isEditing={isEditing}
                        onSave={(content, props) => handleSave(content, props)}
                        onCancel={handleCancel}
                        onEdit={handleEdit}
                    />
                );

            case "divider":
                return <DividerElement />;

            default:
                return null;
        }
    };

    return (
        <div ref={combinedRef} style={style}>
            {/* Индикатор вставки перед элементом - только при добавлении новых элементов */}
            {shouldHighlight && (
                <div
                    style={{
                        height: 3,
                        backgroundColor: "#1890ff",
                        marginBottom: 8,
                        borderRadius: 2,
                        boxShadow: "0 0 8px rgba(24, 144, 255, 0.5)",
                    }}
                />
            )}
            <Card
                style={{
                    marginBottom: 16,
                    border: shouldHighlight ? "2px solid #1890ff" : undefined,
                    transition: "border-color 0.2s",
                }}
                actions={[
                    <div
                        key="drag"
                        {...attributes}
                        {...listeners}
                        style={{
                            cursor: "grab",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px 0",
                        }}
                    >
                        <DragOutlined style={{ fontSize: 16, color: "#8c8c8c" }} />
                    </div>,
                    <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        disabled={element.type === "divider"}
                    >
                        {element.type === "file" ? "Заменить" : "Редактировать"}
                    </Button>,
                    <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={onDelete}>
                        Удалить
                    </Button>,
                ]}
            >
                {renderContent()}
            </Card>
        </div>
    );
};

export default ElementRenderer;

