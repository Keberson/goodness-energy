import { useState, useEffect, useRef } from "react";
import { Layout, Button, Input, Select, Space, Typography, Card, App } from "antd";

const { TextArea } = Input;
import { 
    SaveOutlined, 
    ArrowLeftOutlined,
    FileTextOutlined,
    PictureOutlined,
    UnorderedListOutlined,
    MutedOutlined,
    MinusOutlined,
    LinkOutlined,
    FileOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import {
    useGetPostByIdQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useGetAvailableThemesQuery,
} from "@services/api/volunteer-posts.api";
import { useGetNPOsQuery } from "@services/api/npo.api";
import { useCity } from "@hooks/useCity";
import NewsToolbar from "./components/NewsToolbar/NewsToolbar";
import NewsWorkspace from "./components/NewsWorkspace/NewsWorkspace";
import { convertElementsToNewsData, convertNewsDataToElements } from "./utils/newsConverter";
import "./styles.scss";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const EditNewsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id?: string }>();
    const isEditing = !!id;
    const newsId = id ? Number(id) : 0;
    const { message } = App.useApp();
    
    // Определяем, создаем ли мы новость или историю волонтера
    const isVolunteerPost = location.pathname.includes("/volunteer-posts/edit");

    const [elements, setElements] = useState<NewsEditorElement[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [annotation, setAnnotation] = useState("");
    const [type, setType] = useState<NewsType>("theme");
    const [city, setCity] = useState<string | undefined>(undefined);
    const [themeTag, setThemeTag] = useState<string | undefined>(undefined);
    const [npoId, setNpoId] = useState<number | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const [isLoadingNews, setIsLoadingNews] = useState(false);
    const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);
    const initialRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
    const currentCursorRef = useRef<{ x: number; y: number } | null>(null);

    const { data: newsTypes = [], isLoading: isLoadingTypes } = useGetNewsTypesQuery(undefined, {
        skip: isVolunteerPost,
    });
    const { data: availableThemes = [], isLoading: isLoadingThemes } = useGetAvailableThemesQuery(undefined, {
        skip: !isVolunteerPost,
    });
    const [createNews] = useCreateNewsMutation();
    const [updateNews] = useUpdateNewsMutation();
    const [createPost] = useCreatePostMutation();
    const [updatePost] = useUpdatePostMutation();
    const {
        data: existingNews,
        isLoading: isLoadingExistingNews,
        error: newsError,
    } = useGetNewsByIdQuery(newsId, {
        skip: !isEditing || isNaN(newsId) || isVolunteerPost,
    });
    const {
        data: existingPost,
        isLoading: isLoadingExistingPost,
        error: postError,
    } = useGetPostByIdQuery(newsId, {
        skip: !isEditing || isNaN(newsId) || !isVolunteerPost,
    });
    const { currentCity, availableCities } = useCity();
    const { data: npos = [] } = useGetNPOsQuery(city, {
        skip: !isVolunteerPost,
    });

    const typeMapping: Record<string, NewsType> = {
        Тематика: "theme",
        Документы: "docs",
    };

    const reverseTypeMapping: Record<NewsType, string> = {
        theme: "Тематика",
        docs: "Документы",
    };

    useEffect(() => {
        if (newsTypes.length > 0 && !newsTypes.includes(reverseTypeMapping[type])) {
            const firstAvailableType = typeMapping[newsTypes[0]] || "theme";
            setType(firstAvailableType);
        }
    }, [newsTypes]);

    // Очистка обработчиков при размонтировании компонента
    useEffect(() => {
        return () => {
            dragOffsetRef.current = null;
            initialRectRef.current = null;
            currentCursorRef.current = null;
        };
    }, []);

    // Загрузка существующей новости при редактировании
    useEffect(() => {
        if (isEditing && existingNews && !isLoadingNews && !isVolunteerPost) {
            setIsLoadingNews(true);
            setTitle(existingNews.name || "");
            setAnnotation(existingNews.annotation || "");
            setType(existingNews.type || "theme");
            setCity(existingNews.city || undefined);

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
    }, [isEditing, existingNews, isLoadingNews, message, isVolunteerPost]);
    
    // Загрузка существующей истории волонтера при редактировании
    useEffect(() => {
        if (isEditing && existingPost && !isLoadingNews && isVolunteerPost) {
            setIsLoadingNews(true);
            setTitle(existingPost.name || "");
            setAnnotation(existingPost.annotation || "");
            setCity(existingPost.city || undefined);
            setThemeTag(existingPost.theme_tag || undefined);
            setNpoId(existingPost.npo_id || undefined);

            // Конвертируем HTML в элементы редактора
            try {
                const parsedElements = convertNewsDataToElements(existingPost.text || "");
                setElements(parsedElements);
            } catch (error) {
                console.error("Ошибка при парсинге HTML истории:", error);
                message.error("Ошибка при загрузке контента истории");
            } finally {
                setIsLoadingNews(false);
            }
        }
    }, [isEditing, existingPost, isLoadingNews, message, isVolunteerPost]);

    // Для создания новости по умолчанию подставляем текущий выбранный город
    useEffect(() => {
        if (!isEditing && !city && currentCity) {
            setCity(currentCity);
        }
    }, [isEditing, city, currentCity]);

    // Модификатор для корректировки позиции курсора при перетаскивании
    // Сохраняет относительное положение курсора к элементу
    const snapCenterToCursor = ({ transform, draggingNodeRect, activatorEvent }: {
        transform: { x: number; y: number; scaleX?: number; scaleY?: number };
        draggingNodeRect: { left: number; top: number; width: number; height: number } | null;
        activatorEvent: Event | null;
    }) => {
        const scaleX = (transform.scaleX ?? 1) as number;
        const scaleY = (transform.scaleY ?? 1) as number;
        
        if (!draggingNodeRect || !activatorEvent) {
            return {
                x: transform.x,
                y: transform.y,
                scaleX,
                scaleY,
            };
        }

        // Сохраняем начальный rect элемента при первом вызове
        if (!initialRectRef.current) {
            initialRectRef.current = {
                left: draggingNodeRect.left,
                top: draggingNodeRect.top,
                width: draggingNodeRect.width,
                height: draggingNodeRect.height,
            };
        }

        // Получаем текущие координаты курсора
        // Используем сохраненные координаты из глобального отслеживания, если они есть
        let currentX: number;
        let currentY: number;
        
        if (currentCursorRef.current) {
            currentX = currentCursorRef.current.x;
            currentY = currentCursorRef.current.y;
        } else if (activatorEvent instanceof PointerEvent) {
            currentX = activatorEvent.clientX;
            currentY = activatorEvent.clientY;
        } else if ((activatorEvent as any).clientX !== undefined) {
            currentX = (activatorEvent as any).clientX;
            currentY = (activatorEvent as any).clientY;
        } else {
            return {
                x: transform.x,
                y: transform.y,
                scaleX,
                scaleY,
            };
        }

        // Если offset еще не сохранен, сохраняем его (относительно начальной позиции элемента)
        if (!dragOffsetRef.current && initialRectRef.current) {
            // Вычисляем offset от точки клика до верхнего левого угла элемента
            dragOffsetRef.current = {
                x: currentX - initialRectRef.current.left,
                y: currentY - initialRectRef.current.top,
            };
        }

        // Вычисляем новую позицию элемента так, чтобы курсор оставался на том же месте относительно элемента
        // Используем начальный rect, а не текущий
        if (dragOffsetRef.current && initialRectRef.current) {
            const newX = currentX - dragOffsetRef.current.x - initialRectRef.current.left;
            const newY = currentY - dragOffsetRef.current.y - initialRectRef.current.top;

            return {
                x: newX,
                y: newY,
                scaleX,
                scaleY,
            };
        }

        return {
            x: transform.x,
            y: transform.y,
            scaleX,
            scaleY,
        };
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const toolbarItems = [
        { type: "paragraph" as NewsEditorElementType, label: "Текст", icon: <FileTextOutlined /> },
        { type: "image" as NewsEditorElementType, label: "Изображение", icon: <PictureOutlined /> },
        { type: "list" as NewsEditorElementType, label: "Список", icon: <UnorderedListOutlined /> },
        { type: "quote" as NewsEditorElementType, label: "Цитата", icon: <MutedOutlined /> },
        { type: "link" as NewsEditorElementType, label: "Ссылка", icon: <LinkOutlined /> },
        { type: "file" as NewsEditorElementType, label: "Документ", icon: <FileOutlined /> },
        { type: "divider" as NewsEditorElementType, label: "Разделитель", icon: <MinusOutlined /> },
    ];

    const createElement = (elementType: NewsEditorElementType): NewsEditorElement => {
        const id = `element-${Date.now()}-${Math.random()}`;

        switch (elementType) {
            case "heading":
                return { id, type: "heading", content: "Новый заголовок", props: { level: 2 } };
            case "paragraph":
                return { id, type: "paragraph", content: "" };
            case "image":
                return { id, type: "image", content: 0 };
            case "list":
                return { id, type: "list", content: ["Элемент списка 1", "Элемент списка 2"] };
            case "quote":
                return { id, type: "quote", content: "" };
            case "link":
                return { id, type: "link", content: "", props: { url: "" } };
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
        // Сбрасываем offset и начальный rect при начале нового перетаскивания
        dragOffsetRef.current = null;
        initialRectRef.current = null;
        currentCursorRef.current = null;

        // Отслеживаем текущие координаты курсора во время перетаскивания
        const handleMouseMove = (e: MouseEvent) => {
            currentCursorRef.current = { x: e.clientX, y: e.clientY };
        };

        document.addEventListener('mousemove', handleMouseMove);
        
        // Сохраняем обработчик для удаления при окончании перетаскивания
        if (event.active.data.current) {
            (event.active.data.current as any).cleanup = () => {
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        // Сбрасываем offset и начальный rect при окончании перетаскивания
        dragOffsetRef.current = null;
        initialRectRef.current = null;
        currentCursorRef.current = null;

        // Удаляем обработчик событий мыши
        const cleanup = (active.data.current as any)?.cleanup;
        if (cleanup) {
            cleanup();
        }

        if (!over) return;

        if (active.id.toString().startsWith("toolbar-")) {
            const elementType = active.data.current?.type as NewsEditorElementType;
            if (elementType) {
                const newElement = createElement(elementType);

                if (over.id === "workspace") {
                    // Добавляем элемент в конец workspace
                    setElements((prev) => [...prev, newElement]);
                } else {
                    // Добавляем элемент перед другим элементом в workspace
                    setElements((items) => {
                        const targetIndex = items.findIndex((item) => item.id === over.id);
                        if (targetIndex === -1) {
                            // Если элемент не найден, добавляем в конец
                            return [...items, newElement];
                        }
                        // Вставляем перед найденным элементом
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
        const itemType = isVolunteerPost ? "истории" : "новости";
        if (!title.trim()) {
            message.warning(`Введите заголовок ${itemType}`);
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
                message.warning(`Контент ${itemType} не может быть пустым`);
                return;
            }

            if (isVolunteerPost) {
                // Работа с историей волонтера
                if (isEditing) {
                    const result = await updatePost({
                        id: newsId,
                        data: {
                            name: title.trim(),
                            annotation: annotation.trim() || undefined,
                            text: html,
                            city: city ?? null,
                            theme_tag: themeTag ?? null,
                            npo_id: npoId ?? null,
                            attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                            tags: [],
                        },
                    }).unwrap();

                    message.success("История успешно обновлена");
                    navigate(`/volunteer-posts/${result.id}`);
                } else {
                    const result = await createPost({
                        name: title.trim(),
                        annotation: annotation.trim() || undefined,
                        text: html,
                        city: city ?? null,
                        theme_tag: themeTag ?? null,
                        npo_id: npoId ?? null,
                        attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                        tags: [],
                    }).unwrap();

                    message.success("История успешно сохранена");
                    navigate(`/volunteer-posts/${result.id}`);
                }
            } else {
                // Работа с новостью
                if (isEditing) {
                    const result = await updateNews({
                        id: newsId,
                        body: {
                            name: title.trim(),
                            annotation: annotation.trim() || undefined,
                            text: html,
                            city: city || undefined,
                            type,
                            attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                            tags: [],
                        },
                    }).unwrap();

                    message.success("Новость успешно обновлена");
                    navigate(`/news/${result.id}`);
                } else {
                    const result = await createNews({
                        name: title.trim(),
                        annotation: annotation.trim() || undefined,
                        text: html,
                        city: city || undefined,
                        type,
                        attachedIds: attachedIds.length > 0 ? attachedIds : undefined,
                        tags: [],
                    }).unwrap();

                    message.success("Новость успешно сохранена");
                    navigate(`/news/${result.id}`);
                }
            }
        } catch (error: any) {
            console.error(`Ошибка при сохранении ${isVolunteerPost ? "истории" : "новости"}:`, error);
            message.error(
                error?.data?.detail || `Произошла ошибка при сохранении ${itemType}`
            );
        } finally {
            setSaving(false);
        }
    };

    const renderDragOverlayContent = () => {
        if (!activeId) return null;

        // Если перетаскивается элемент из тулбара
        if (activeId.toString().startsWith("toolbar-")) {
            const elementType = activeId.toString().replace("toolbar-", "") as NewsEditorElementType;
            const toolbarItem = toolbarItems.find((item) => item.type === elementType);
            
            if (toolbarItem) {
                return (
                    <Card
                        size="small"
                        style={{
                            opacity: 0.9,
                            width: 200,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            border: "2px dashed #1890ff",
                            transform: "rotate(2deg)",
                        }}
                        styles={{ body: { padding: "12px" } }}
                    >
                        <Space>
                            {toolbarItem.icon}
                            <Text strong>{toolbarItem.label}</Text>
                        </Space>
                    </Card>
                );
            }
        }

        // Если перетаскивается существующий элемент
        const element = elements.find((el) => el.id === activeId);
        if (element) {
            return (
                <Card
                    style={{
                        opacity: 0.8,
                        width: 400,
                    }}
                >
                    {element.type === "quote" && (
                        <Card
                            style={{ borderLeft: "4px solid #1890ff", backgroundColor: "#f0f0f0" }}
                            styles={{ body: { padding: "12px" } }}
                        >
                            <Text italic>"{element.content as string}"</Text>
                            {element.props?.author && (
                                <div style={{ marginTop: 8, textAlign: "left" }}>
                                    <Text type="secondary">— {element.props.author as string}</Text>
                                </div>
                            )}
                        </Card>
                    )}
                    {element.type === "heading" && (
                        <Title level={((element.props?.level as number) || 2) as 1 | 2 | 3 | 4 | 5}>
                            {element.content as string}
                        </Title>
                    )}
                    {element.type === "paragraph" && <Text>{element.content as string}</Text>}
                    {element.type === "divider" && <div style={{ borderTop: "1px solid #d9d9d9" }} />}
                    {!["quote", "heading", "paragraph", "divider"].includes(element.type) && (
                        <Text>Элемент: {element.type}</Text>
                    )}
                </Card>
            );
        }

        return null;
    };

    // Показываем загрузку при получении существующей новости/истории
    if (isEditing && ((!isVolunteerPost && (isLoadingExistingNews || isLoadingNews)) || (isVolunteerPost && (isLoadingExistingPost || isLoadingNews)))) {
        return (
            <div style={{ padding: 24 }}>
                <Card loading={true} />
            </div>
        );
    }

    // Показываем ошибку, если новость/история не найдена
    if (isEditing && ((!isVolunteerPost && newsError) || (isVolunteerPost && postError))) {
        const itemType = isVolunteerPost ? "история" : "новость";
        const listPath = isVolunteerPost ? "/volunteer-posts" : "/news";
        const listLabel = isVolunteerPost ? "историй волонтеров" : "новостей";
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Title level={3}>{itemType.charAt(0).toUpperCase() + itemType.slice(1)} не найдена</Title>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(listPath)}
                    >
                        Назад к списку {listLabel}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
            modifiers={[snapCenterToCursor]}
        >
            <Layout style={{ minHeight: "calc(100vh - 48px)" }}>
                <Content>
                    <div style={{ padding: 24, backgroundColor: "#fff" }}>
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(isVolunteerPost ? "/volunteer-posts" : "/news")}
                            style={{ marginBottom: 16, padding: 0 }}
                        >
                            Назад к списку {isVolunteerPost ? "историй волонтеров" : "новостей"}
                        </Button>
                        <Title level={2} style={{ marginBottom: 24 }}>
                            {isEditing 
                                ? (isVolunteerPost ? "Редактирование истории" : "Редактирование новости")
                                : (isVolunteerPost ? "Создание истории" : "Создание новости")
                            }
                        </Title>
                        <Card style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                <div>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        Заголовок {isVolunteerPost ? "истории" : "новости"}
                                    </Title>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={`Введите заголовок ${isVolunteerPost ? "истории" : "новости"}`}
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
                                        placeholder={`Введите краткое описание ${isVolunteerPost ? "истории" : "новости"} для отображения в списке (необязательно)`}
                                        rows={3}
                                        maxLength={500}
                                        showCount
                                    />
                                </div>
                                {!isVolunteerPost && (
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
                                )}
                                {isVolunteerPost && (
                                    <>
                                        <div>
                                            <Title level={5} style={{ marginBottom: 8 }}>
                                                Город (необязательно)
                                            </Title>
                                            <Select
                                                allowClear
                                                placeholder="Не выбрано"
                                                value={city}
                                                onChange={(value) => {
                                                    setCity(value || undefined);
                                                    // При изменении города сбрасываем НКО, если оно не соответствует новому городу
                                                    if (value && npoId) {
                                                        const selectedNpo = npos.find(n => n.id === npoId);
                                                        if (selectedNpo && selectedNpo.city !== value) {
                                                            setNpoId(undefined);
                                                        }
                                                    } else if (!value) {
                                                        setNpoId(undefined);
                                                    }
                                                }}
                                                style={{ width: 260 }}
                                                size="large"
                                            >
                                                {availableCities.map((cityName) => (
                                                    <Option key={cityName} value={cityName}>
                                                        {cityName}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <Title level={5} style={{ marginBottom: 8 }}>
                                                НКО (необязательно)
                                            </Title>
                                            <Select
                                                allowClear
                                                placeholder="Не выбрано"
                                                value={npoId}
                                                onChange={(value) => setNpoId(value || undefined)}
                                                style={{ width: 260 }}
                                                size="large"
                                                showSearch
                                                disabled={!city}
                                                filterOption={(input, option) =>
                                                    String(option?.label ?? option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {npos.map((npo) => (
                                                    <Option key={npo.id} value={npo.id}>
                                                        {npo.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                        <div>
                                            <Title level={5} style={{ marginBottom: 8 }}>
                                                Тематика (необязательно)
                                            </Title>
                                            <Select
                                                allowClear
                                                placeholder="Не выбрано"
                                                value={themeTag}
                                                onChange={(value) => setThemeTag(value || undefined)}
                                                style={{ width: 260 }}
                                                size="large"
                                                loading={isLoadingThemes}
                                            >
                                                {availableThemes.map((theme) => (
                                                    <Option key={theme} value={theme}>
                                                        {theme}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </>
                                )}
                                {!isVolunteerPost && (
                                    <div>
                                        <Title level={5} style={{ marginBottom: 8 }}>
                                            Город новости (необязательно)
                                        </Title>
                                        <Select
                                            allowClear
                                            placeholder="Выберите город"
                                            value={city}
                                            onChange={(value) => setCity(value || undefined)}
                                            style={{ width: 260 }}
                                            size="large"
                                        >
                                            {availableCities.map((cityName) => (
                                                <Option key={cityName} value={cityName}>
                                                    {cityName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={handleSave}
                                    size="large"
                                    loading={saving}
                                    disabled={!title.trim() || elements.length === 0 || saving}
                                >
                                    {isEditing 
                                        ? (isVolunteerPost ? "Обновить историю" : "Обновить новость")
                                        : (isVolunteerPost ? "Сохранить историю" : "Сохранить новость")
                                    }
                                </Button>
                            </Space>
                        </Card>
                        <div>
                            <Title level={5}>Контент новости</Title>
                            <NewsWorkspace
                                elements={elements}
                                onUpdateElement={handleUpdateElement}
                                onDeleteElement={handleDeleteElement}
                                activeId={activeId}
                            />
                        </div>
                    </div>
                </Content>
                <Sider width={280} theme="light" style={{ borderLeft: "1px solid #f0f0f0" }}>
                    <NewsToolbar />
                </Sider>
            </Layout>
            <DragOverlay dropAnimation={null}>
                {renderDragOverlayContent()}
            </DragOverlay>
        </DndContext>
    );
};

export default EditNewsPage;
