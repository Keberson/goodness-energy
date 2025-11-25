import { useState, useEffect } from "react";
import { Layout, Button, Input, Select, Space, Typography, Card, message } from "antd";

const { TextArea } = Input;
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import type { NewsEditorElement, NewsEditorElementType } from "@app-types/news-editor.types";
import type { NewsType } from "@app-types/news.types";
import {
    useGetNewsTypesQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useGetNewsByIdQuery,
} from "@services/api/news.api";
import NewsToolbar from "./components/NewsToolbar/NewsToolbar";
import NewsWorkspace from "./components/NewsWorkspace/NewsWorkspace";
import { convertElementsToNewsData, convertNewsDataToElements } from "./utils/newsConverter";
import "./styles.scss";

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

const EditNewsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditing = !!id;
    const newsId = id ? Number(id) : 0;

    const [elements, setElements] = useState<NewsEditorElement[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [annotation, setAnnotation] = useState("");
    const [type, setType] = useState<NewsType>("blog");
    const [saving, setSaving] = useState(false);
    const [isLoadingNews, setIsLoadingNews] = useState(false);

    const { data: newsTypes = [], isLoading: isLoadingTypes } = useGetNewsTypesQuery();
    const [createNews] = useCreateNewsMutation();
    const [updateNews] = useUpdateNewsMutation();
    const {
        data: existingNews,
        isLoading: isLoadingExistingNews,
        error: newsError,
    } = useGetNewsByIdQuery(newsId, {
        skip: !isEditing || isNaN(newsId),
    });

    const typeMapping: Record<string, NewsType> = {
        Блог: "blog",
        Образование: "edu",
        Документы: "docs",
    };

    const reverseTypeMapping: Record<NewsType, string> = {
        blog: "Блог",
        edu: "Образование",
        docs: "Документы",
    };

    useEffect(() => {
        if (newsTypes.length > 0 && !newsTypes.includes(reverseTypeMapping[type])) {
            const firstAvailableType = typeMapping[newsTypes[0]] || "blog";
            setType(firstAvailableType);
        }
    }, [newsTypes]);

    // Загрузка существующей новости при редактировании
    useEffect(() => {
        if (isEditing && existingNews && !isLoadingNews) {
            setIsLoadingNews(true);
            setTitle(existingNews.name || "");
            setAnnotation(existingNews.annotation || "");
            setType(existingNews.type || "blog");

            // Конвертируем HTML в элементы редактора
            try {
                const parsedElements = convertNewsDataToElements(existingNews.text || "");
                setElements(parsedElements);
            } catch (error) {
                console.error("Ошибка при парсинге HTML новости:", error);
                message.error("Ошибка при загрузке контента новости");
            } finally {
                setIsLoadingNews(false);
            }
        }
    }, [isEditing, existingNews, isLoadingNews]);

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
        if (!title.trim()) {
            message.warning("Введите заголовок новости");
            return;
        }

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
            const { html, attachedIds } = convertElementsToNewsData(elements);

            if (!html.trim()) {
                message.warning("Контент новости не может быть пустым");
                return;
            }

            if (isEditing) {
                // Редактирование существующей новости
                const result = await updateNews({
                    id: newsId,
                    body: {
                        name: title.trim(),
                        annotation: annotation.trim() || undefined,
                        text: html,
                        type,
                        attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                        tags: [],
                    },
                }).unwrap();

                message.success("Новость успешно обновлена");
                navigate(`/news/${result.id}`);
            } else {
                // Создание новой новости
                const result = await createNews({
                    name: title.trim(),
                    annotation: annotation.trim() || undefined,
                    text: html,
                    type,
                    attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                    tags: [],
                }).unwrap();

                message.success("Новость успешно сохранена");
                navigate(`/news/${result.id}`);
            }
        } catch (error: any) {
            console.error("Ошибка при сохранении новости:", error);
            message.error(
                error?.data?.detail || "Произошла ошибка при сохранении новости"
            );
        } finally {
            setSaving(false);
        }
    };

    // Показываем загрузку при получении существующей новости
    if (isEditing && (isLoadingExistingNews || isLoadingNews)) {
        return (
            <div style={{ padding: 24 }}>
                <Card loading={true} />
            </div>
        );
    }

    // Показываем ошибку, если новость не найдена
    if (isEditing && newsError) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Title level={3}>Новость не найдена</Title>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/news")}
                    >
                        Назад к списку новостей
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Layout style={{ minHeight: "calc(100vh - 48px)" }}>
                <Content>
                    <div style={{ padding: 24, backgroundColor: "#fff" }}>
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/news")}
                            style={{ marginBottom: 16, padding: 0 }}
                        >
                            Назад к списку новостей
                        </Button>
                        <Title level={2} style={{ marginBottom: 24 }}>
                            {isEditing ? "Редактирование новости" : "Создание новости"}
                        </Title>
                        <Card style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                <div>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        Заголовок новости
                                    </Title>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Введите заголовок новости"
                                        size="large"
                                    />
                                </div>
                                <div>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        Краткое описание (аннотация)
                                    </Title>
                                    <TextArea
                                        value={annotation}
                                        onChange={(e) => setAnnotation(e.target.value)}
                                        placeholder="Введите краткое описание новости для отображения в списке (необязательно)"
                                        rows={3}
                                        maxLength={500}
                                        showCount
                                    />
                                </div>
                                <div>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        Тип новости
                                    </Title>
                                    <Select
                                        value={type}
                                        onChange={(value) => setType(value as NewsType)}
                                        style={{ width: 200 }}
                                        size="large"
                                        loading={isLoadingTypes}
                                        disabled={isLoadingTypes}
                                    >
                                        {newsTypes.map((typeName) => {
                                            const typeValue = typeMapping[typeName];
                                            return (
                                                <Option key={typeValue} value={typeValue}>
                                                    {typeName}
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                </div>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    size="large"
                                    loading={saving}
                                    disabled={!title.trim() || elements.length === 0 || saving}
                                >
                                    {isEditing ? "Обновить новость" : "Сохранить новость"}
                                </Button>
                            </Space>
                        </Card>
                        <div>
                            <Title level={5}>Контент новости</Title>
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

export default EditNewsPage;
