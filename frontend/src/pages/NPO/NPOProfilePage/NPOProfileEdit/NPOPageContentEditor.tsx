import { useState, useEffect } from "react";
import { Layout, Button, Card, Typography, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { NewsEditorElement, NewsEditorElementType } from "@app-types/news-editor.types";
import NewsToolbar from "../../../News/EditNewsPage/components/NewsToolbar/NewsToolbar";
import NewsWorkspace from "../../../News/EditNewsPage/components/NewsWorkspace/NewsWorkspace";
import {
    convertElementsToNewsData,
    convertNewsDataToElements,
} from "../../../News/EditNewsPage/utils/newsConverter";

const { Content, Sider } = Layout;
const { Title } = Typography;

interface NPOPageContentEditorProps {
    initialContent: string | null;
    onSave: (content: string) => void;
    onCancel: () => void;
    onBack?: () => void;
}

const NPOPageContentEditor: React.FC<NPOPageContentEditorProps> = ({
    initialContent,
    onSave,
    onCancel,
    onBack,
}) => {
    const [elements, setElements] = useState<NewsEditorElement[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    // Загрузка существующего контента
    useEffect(() => {
        if (initialContent && !isLoadingContent) {
            setIsLoadingContent(true);
            try {
                const parsedElements = convertNewsDataToElements(initialContent);
                setElements(parsedElements);
            } catch (error) {
                console.error("Ошибка при парсинге HTML контента:", error);
                message.error("Ошибка при загрузке контента страницы");
            } finally {
                setIsLoadingContent(false);
            }
        } else if (!initialContent) {
            // Если контента нет, очищаем элементы
            setElements([]);
        }
    }, [initialContent]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const createElement = (elementType: NewsEditorElementType): NewsEditorElement => {
        const id = `element-${Date.now()}-${Math.random()}`;

        switch (elementType) {
            case "heading":
                return { id, type: "heading", content: "Новый заголовок", props: { level: 2 } };
            case "paragraph":
                return { id, type: "paragraph", content: "Введите текст..." };
            case "image":
                return { id, type: "image", content: 0 };
            case "list":
                return { id, type: "list", content: ["Элемент списка 1", "Элемент списка 2"] };
            case "quote":
                return { id, type: "quote", content: "Введите цитату..." };
            case "link":
                return { id, type: "link", content: "Текст ссылки", props: { url: "" } };
            case "file":
                return { id, type: "file", content: 0 };
            case "divider":
                return { id, type: "divider", content: "" };
            default:
                return { id, type: "paragraph", content: "" };
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        if (active.id.toString().startsWith("toolbar-")) {
            const elementType = active.data.current?.type as NewsEditorElementType;
            if (elementType) {
                const newElement = createElement(elementType);

                if (over.id === "workspace") {
                    setElements((prev) => [...prev, newElement]);
                } else {
                    setElements((items) => {
                        const targetIndex = items.findIndex((item) => item.id === over.id);
                        if (targetIndex === -1) {
                            return [...items, newElement];
                        }
                        const newItems = [...items];
                        newItems.splice(targetIndex, 0, newElement);
                        return newItems;
                    });
                }
            }
            return;
        }

        if (active.id !== over.id) {
            setElements((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                if (oldIndex === -1 || newIndex === -1) return items;

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleUpdateElement = (
        id: string,
        content: string | string[] | number | number[],
        props?: Record<string, any>
    ) => {
        setElements((prev) =>
            prev.map((el) =>
                el.id === id
                    ? { ...el, content, props: props ? { ...el.props, ...props } : el.props }
                    : el
            )
        );
    };

    const handleDeleteElement = (id: string) => {
        setElements((prev) => prev.filter((el) => el.id !== id));
    };

    const handleSave = async () => {
        if (elements.length === 0) {
            message.warning("Добавьте хотя бы один элемент контента");
            return;
        }

        const hasContent = elements.some((el) => {
            if (el.type === "divider") return true;
            if (typeof el.content === "string" && el.content.trim()) return true;
            if (Array.isArray(el.content) && el.content.length > 0) return true;
            if (typeof el.content === "number" && el.content > 0) return true;
            return false;
        });

        if (!hasContent) {
            message.warning("Добавьте контент в элементы");
            return;
        }

        try {
            setSaving(true);
            const { html } = convertElementsToNewsData(elements);

            if (!html.trim()) {
                message.warning("Контент страницы не может быть пустым");
                return;
            }

            // Получаем текущие данные НКО
            // Вместо этого, мы просто передаем HTML в onSave
            onSave(html);
        } catch (error: any) {
            console.error("Ошибка при сохранении контента:", error);
            message.error("Произошла ошибка при сохранении контента страницы");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Layout style={{ minHeight: "calc(100vh - 48px)" }}>
                <Content>
                    <div style={{ padding: 24, backgroundColor: "#fff" }}>
                        <div style={{ marginBottom: 24 }}>
                            {onBack && (
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={onBack}
                                    style={{ marginBottom: 16, padding: 0 }}
                                >
                                    Назад к редактированию профиля
                                </Button>
                            )}
                            <Title level={3} style={{ marginBottom: 0 }}>
                                Редактирование страницы профиля
                            </Title>
                        </div>
                        <Card style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 16 }}>
                                <Button
                                    type="default"
                                    onClick={onCancel}
                                    style={{ marginRight: 8 }}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    loading={saving}
                                    disabled={elements.length === 0 || saving}
                                >
                                    Сохранить страницу
                                </Button>
                            </div>
                        </Card>
                        <div>
                            <Title level={5}>Контент страницы</Title>
                            <NewsWorkspace
                                elements={elements}
                                onUpdateElement={handleUpdateElement}
                                onDeleteElement={handleDeleteElement}
                            />
                        </div>
                    </div>
                </Content>
                <Sider width={280} theme="light" style={{ borderLeft: "1px solid #f0f0f0" }}>
                    <NewsToolbar />
                </Sider>
            </Layout>
            <DragOverlay>
                {activeId ? (
                    <Card
                        style={{
                            opacity: 0.8,
                            transform: "rotate(5deg)",
                        }}
                    >
                        Перетаскивание...
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default NPOPageContentEditor;
