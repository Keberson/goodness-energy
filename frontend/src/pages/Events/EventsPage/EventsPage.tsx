import { Card, Typography, Tag, Space, List, Empty, Tooltip, Button, App, Flex, Modal, Form, Input, DatePicker, Select, InputNumber, Upload, Row, Col } from "antd";
import { Calendar } from "antd";
import { 
    ClockCircleOutlined, 
    EnvironmentOutlined, 
    LeftOutlined, 
    RightOutlined, 
    PlusOutlined, 
    AppstoreOutlined, 
    UploadOutlined, 
    DeleteOutlined,
    GlobalOutlined,
    UserOutlined,
    BookOutlined,
    ThunderboltOutlined,
    HeartOutlined,
    HomeOutlined,
    ReadOutlined,
    TeamOutlined,
    BugOutlined,
    BulbOutlined,
    GiftOutlined,
    BankOutlined,
    MoreOutlined
} from "@ant-design/icons";
import React from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useGetEventsQuery, useGetEventTagsQuery } from "@services/api/events.api";
import { useRegisterEventViewMutation, useGetNPOByIdQuery, useCreateEventMutation } from "@services/api/npo.api";
import { useGetVolunteerEventsQuery, useRespondToEventMutation, useDeleteEventResponseMutation } from "@services/api/volunteer.api";
import { useLazyGeodecodeQuery } from "@services/api/geodecode.api";
import { useUploadFileMutation } from "@services/api/files.api";
import type { IEvent } from "@app-types/events.types";
import type { IEventCreateRequest } from "@services/api/npo.api";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAppSelector from "@hooks/useAppSelector";
import { useCity } from "@hooks/useCity";
import { skipToken } from "@reduxjs/toolkit/query";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import FilePreview from "@components/FilePreview/FilePreview";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const EventsPage = () => {
    const { currentCity } = useCity();
    const { availableCities } = useCity();
    const { data: allEvents, isLoading, refetch: refetchEvents } = useGetEventsQuery(currentCity);
    const { data: eventTags = [] } = useGetEventTagsQuery();
    const { message } = App.useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const dateParam = searchParams.get("date");
    
    // Состояние для фильтрации по тегам
    const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);
    
    // Фильтруем события: показываем только опубликованные и завершённые
    // Фильтруем по выбранным тегам, если они выбраны
    // Сортируем по дате создания (новые первыми)
    const events = useMemo(() => {
        if (!allEvents) return [];
        let filtered = allEvents.filter((event) => 
            event.status === "published" || event.status === "completed"
        );
        
        // Фильтрация по тегам
        if (selectedTagsFilter.length > 0) {
            filtered = filtered.filter((event) => {
                if (!event.tags || event.tags.length === 0) return false;
                // Событие проходит фильтр, если хотя бы один из его тегов совпадает с выбранными
                return event.tags.some((tag) => selectedTagsFilter.includes(tag));
            });
        }
        
        // Сортируем по дате создания (новые первыми) - создаем новый массив
        return [...filtered].sort((a, b) => {
            const dateA = dayjs(a.created_at).valueOf();
            const dateB = dayjs(b.created_at).valueOf();
            return dateB - dateA; // По убыванию (новые первыми)
        });
    }, [allEvents, selectedTagsFilter]);
    
    // Инициализируем selectedDate из URL параметра или текущей даты
    const initialDate = dateParam ? dayjs(dateParam) : dayjs();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate);
    const [mode, setMode] = useState<"month" | "year">("month");
    const [registerEventView] = useRegisterEventViewMutation();
    
    // Состояние для модального окна создания события
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm();
    const [createAttachedIds, setCreateAttachedIds] = useState<number[]>([]);
    const [createUploading, setCreateUploading] = useState(false);
    const [createEvent] = useCreateEventMutation();
    const [geodecode] = useLazyGeodecodeQuery();
    const [uploadFile] = useUploadFileMutation();
    
    // Обновляем selectedDate при изменении параметра date в URL
    useEffect(() => {
        if (dateParam) {
            const parsedDate = dayjs(dateParam);
            if (parsedDate.isValid()) {
                setSelectedDate(parsedDate);
                // Очищаем параметр date из URL после установки даты
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.delete("date");
                setSearchParams(newSearchParams, { replace: true });
            }
        }
    }, [dateParam, searchParams, setSearchParams]);
    
    // Проверка авторизации и получение событий волонтёра
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);
    const isVolunteer = isAuthenticated && userType === "volunteer";
    const isNPO = isAuthenticated && userType === "npo";
    const navigate = useNavigate();
    
    // Получаем данные НКО для проверки статуса
    const { data: npoData } = useGetNPOByIdQuery(isNPO && userId ? userId : skipToken);
    const isNPOConfirmed = isNPO && npoData?.status === "confirmed";
    
    const { data: volunteerEvents } = useGetVolunteerEventsQuery(
        isVolunteer && userId ? userId : skipToken
    );
    const [respondToEvent] = useRespondToEventMutation();
    const [deleteEventResponse] = useDeleteEventResponseMutation();
    
    // Создаём Set для быстрой проверки, откликнулся ли волонтёр на событие
    const respondedEventIds = useMemo(() => {
        if (!volunteerEvents) return new Set<number>();
        return new Set(volunteerEvents.map((event) => event.id));
    }, [volunteerEvents]);

    // Группируем события по датам (событие отображается на каждый день от start до end)
    // Фильтрация по городу теперь происходит на бэкенде
    const eventsByDate = useMemo(() => {
        if (!events) return new Map<string, IEvent[]>();

        const map = new Map<string, IEvent[]>();
        events.forEach((event) => {
            const startDate = dayjs(event.start).startOf("day");
            const endDate = dayjs(event.end).startOf("day");
            
            // Добавляем событие на каждый день от начала до конца включительно
            let currentDate = startDate;
            while (currentDate.isBefore(endDate, "day") || currentDate.isSame(endDate, "day")) {
                const dateKey = currentDate.format("YYYY-MM-DD");
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(event);
                currentDate = currentDate.add(1, "day");
            }
        });
        
        // Сортируем события внутри каждой даты по дате создания (новые первыми)
        map.forEach((eventList, dateKey) => {
            const sorted = [...eventList].sort((a, b) => {
                const dateA = dayjs(a.created_at).valueOf();
                const dateB = dayjs(b.created_at).valueOf();
                return dateB - dateA; // По убыванию (новые первыми)
            });
            map.set(dateKey, sorted);
        });
        
        return map;
    }, [events]);

    // Получаем события для выбранной даты (события, которые идут в этот день)
    const selectedDateEvents = useMemo(() => {
        const dateStart = selectedDate.startOf("day");
        const dateEnd = selectedDate.endOf("day");
        
        // Фильтруем события, которые пересекаются с выбранной датой
        const filtered = (events || []).filter((event) => {
            const eventStart = dayjs(event.start);
            const eventEnd = dayjs(event.end);
            // Событие попадает в выбранный день, если оно начинается до конца дня и заканчивается после начала дня
            return (eventStart.isBefore(dateEnd) || eventStart.isSame(dateEnd)) && 
                   (eventEnd.isAfter(dateStart) || eventEnd.isSame(dateStart));
        });
        
        // Сортируем по дате создания (новые первыми) - создаем новый массив
        return [...filtered].sort((a, b) => {
            const dateA = dayjs(a.created_at).valueOf();
            const dateB = dayjs(b.created_at).valueOf();
            return dateB - dateA; // По убыванию (новые первыми)
        });
    }, [selectedDate, events]);

    // Регистрируем просмотры для всех событий выбранной даты
    useEffect(() => {
        if (selectedDateEvents.length > 0) {
            selectedDateEvents.forEach((event) => {
                registerEventView({
                    npoId: event.npo_id,
                    eventId: event.id,
                }).catch(() => {
                    // Игнорируем ошибки при регистрации просмотра
                });
            });
        }
    }, [selectedDate, selectedDateEvents, registerEventView]);

    // Функция для получения цвета тега
    const getTagColor = (tag: string): string => {
        // Список цветов для тегов
        const colors = [
            "red", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple", "magenta",
            "volcano", "geekblue", "cyan", "blue", "purple", "magenta", "red", "orange", "gold", "lime"
        ];
        
        // Используем хеш тега для выбора цвета
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Функция для получения иконки тега
    const getTagIcon = (tag: string) => {
        const tagIconMap: Record<string, React.ReactNode> = {
            "Экология": <GlobalOutlined />,
            "Пожилые люди": <UserOutlined />,
            "Обучение": <BookOutlined />,
            "Спорт": <ThunderboltOutlined />,
            "Здоровье": <HeartOutlined />,
            "Местное сообщество": <HomeOutlined />,
            "Образование": <ReadOutlined />,
            "Социальная помощь": <TeamOutlined />,
            "Защита животных": <BugOutlined />,
            "Творчество": <BulbOutlined />,
            "Благотворительность": <GiftOutlined />,
            "Культура": <BankOutlined />,
            "Психология": <HeartOutlined />,
            "Другое": <MoreOutlined />,
        };
        return tagIconMap[tag] || <MoreOutlined />;
    };

    // Функция для получения цвета иконки на основе цвета тега
    const getTagIconColor = (colorName: string): string => {
        const colorMap: Record<string, string> = {
            "red": "#ff4d4f",
            "volcano": "#ff7a45",
            "orange": "#ff9800",
            "gold": "#ffc53d",
            "lime": "#a0d911",
            "green": "#52c41a",
            "cyan": "#13c2c2",
            "blue": "#1890ff",
            "geekblue": "#2f54eb",
            "purple": "#722ed1",
            "magenta": "#eb2f96",
            "default": "#d9d9d9",
        };
        return colorMap[colorName] || colorMap["default"];
    };


    const handleRespondToEvent = async (eventId: number) => {
        if (!isVolunteer) {
            message.warning("Для отклика на событие необходимо авторизоваться как волонтёр");
            return;
        }

        try {
            await respondToEvent(eventId).unwrap();
            message.success("Вы успешно откликнулись на событие!");

            // После отклика обновляем список событий, чтобы количество свободных мест
            // и статус события сразу обновились без перезагрузки страницы
            refetchEvents();
        } catch (error: any) {
            if (error?.data?.detail) {
                message.error(error.data.detail);
            } else {
                message.error("Не удалось откликнуться на событие");
            }
        }
    };

    const handleCancelResponse = async (eventId: number) => {
        try {
            await deleteEventResponse(eventId).unwrap();
            message.success("Участие в событии отменено");
            // Обновляем список событий, чтобы сразу обновились свободные места и состояние кнопки
            refetchEvents();
        } catch (error: any) {
            if (error?.data?.detail) {
                message.error(error.data.detail);
            } else {
                message.error("Не удалось отменить участие в событии");
            }
        }
    };

    const isEventResponded = (eventId: number): boolean => {
        return respondedEventIds.has(eventId);
    };

    const isEventPast = (event: IEvent): boolean => {
        const now = dayjs();
        const eventEnd = dayjs(event.end);
        return eventEnd.isBefore(now, "minute");
    };

    // Кастомный заголовок календаря без переключателя режимов
    const headerRender = ({ value, onChange }: any) => {
        const monthName = value.locale("ru").format("MMMM YYYY");
        
        const onPrev = () => {
            const newValue = value.subtract(1, "month");
            onChange(newValue);
        };
        
        const onNext = () => {
            const newValue = value.add(1, "month");
            onChange(newValue);
        };
        
        const onToday = () => {
            onChange(dayjs());
        };

        return (
            <div className="events-calendar__header">
                <Button
                    type="text"
                    icon={<LeftOutlined />}
                    onClick={onPrev}
                    className="events-calendar__header-button"
                />
                <Button
                    type="text"
                    onClick={onToday}
                    className="events-calendar__header-title"
                >
                    {monthName}
                </Button>
                <Button
                    type="text"
                    icon={<RightOutlined />}
                    onClick={onNext}
                    className="events-calendar__header-button"
                />
            </div>
        );
    };

    // Функция для рендеринга ячеек календаря
    const cellRender = (value: Dayjs, info: any) => {
        // Рендерим только для ячеек дат, не для месяцев
        if (info?.type !== 'date') {
            return null;
        }

        const dateKey = value.format("YYYY-MM-DD");
        const dayEvents = eventsByDate.get(dateKey) || [];

        if (dayEvents.length === 0) {
            return null;
        }

        return (
            <div className="events-calendar__events-indicators">
                {dayEvents.slice(0, 3).map((event) => {
                    // Берем первый тег события для отображения иконки
                    const firstTag = event.tags && event.tags.length > 0 ? event.tags[0] : null;
                    const tagColor = firstTag ? getTagColor(firstTag) : "default";
                    const tagIcon = firstTag ? getTagIcon(firstTag) : <MoreOutlined />;
                    
                    return (
                        <Tooltip
                            key={event.id}
                            title={
                                <div>
                                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                                        {event.name}
                                    </div>
                                    {event.description && (
                                        <div style={{ fontSize: "12px" }}>{event.description}</div>
                                    )}
                                    <div style={{ fontSize: "11px", marginTop: 4 }}>
                                        {dayjs(event.start).format("DD.MM.YYYY HH:mm")} -{" "}
                                        {dayjs(event.end).format("DD.MM.YYYY HH:mm")}
                                    </div>
                                    {event.tags && event.tags.length > 0 && (
                                        <div style={{ fontSize: "11px", marginTop: 4 }}>
                                            <Space wrap size={[4, 4]}>
                                                {event.tags.map((tag) => (
                                                    <Tag key={tag} color={getTagColor(tag)} style={{ margin: 0 }}>
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    )}
                                </div>
                            }
                            placement="top"
                        >
                            <span 
                                className="events-calendar__event-indicator"
                                style={{ 
                                    color: getTagIconColor(tagColor),
                                    fontSize: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                {tagIcon}
                            </span>
                        </Tooltip>
                    );
                })}
                {dayEvents.length > 3 && (
                    <Tooltip
                        title={`Еще ${dayEvents.length - 3} событий`}
                        placement="top"
                    >
                        <span className="events-calendar__more-indicator">
                            +{dayEvents.length - 3}
                        </span>
                    </Tooltip>
                )}
            </div>
        );
    };

    const handleCreateEvent = () => {
        setIsCreateModalOpen(true);
        createForm.resetFields();
        setCreateAttachedIds([]);
    };

    const handleCreateSubmit = async (status: "draft" | "published") => {
        if (!npoData) return;

        try {
            const values = await createForm.validateFields();
            const [start, end] = values.dateRange as [Dayjs, Dayjs];

            // Преобразуем адрес в координаты через геокодирование
            let coordinates: [number, number] | null = null;
            if (values.address && values.address.trim()) {
                try {
                    const geoResponse = await geodecode(values.address.trim()).unwrap();
                    const geo = geoResponse.response.GeoObjectCollection.featureMember[0]?.GeoObject?.Point?.pos;
                    if (geo) {
                        const [lon, lat] = geo.split(" ").map((item) => Number(item));
                        coordinates = [lat, lon];
                    } else {
                        message.warning("Не удалось найти координаты для указанного адреса");
                    }
                } catch (error) {
                    message.error("Ошибка при геокодировании адреса. Проверьте правильность адреса.");
                    return;
                }
            }

            // Теги теперь приходят как массив из Select
            const tags = Array.isArray(values.tags) ? values.tags.filter((t: string) => t && t.length > 0) : [];
            
            // Проверка, что теги не пустые (обязательное поле)
            if (tags.length === 0) {
                message.error("Необходимо выбрать хотя бы один тег");
                return;
            }

            const createData: IEventCreateRequest = {
                name: values.name,
                description: values.description || null,
                start: start.toISOString(),
                end: end.toISOString(),
                coordinates,
                quantity: values.quantity,
                tags: tags, // Теги обязательны
                city: values.city,
                attachedIds: createAttachedIds.length > 0 ? createAttachedIds : null,
                status: status,
            };
            await createEvent({ npoId: npoData.id, body: createData }).unwrap();
            message.success(status === "published" ? "Событие опубликовано" : "Событие сохранено как черновик");
            setIsCreateModalOpen(false);
            setCreateAttachedIds([]);
            createForm.resetFields();
            // Обновляем список событий, чтобы новое событие появилось первым
            refetchEvents();
        } catch (error: any) {
            if (error?.data?.detail) {
                message.error(error.data.detail);
            } else {
                message.error("Ошибка при создании события");
            }
        }
    };

    return (
        <div className="events-page">
            <div className="events-page__container">
                <Card className="events-page__card" loading={isLoading}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                        <Title level={3} className="events-page__title" style={{ margin: 0 }}>
                            Календарь событий в городе {currentCity}
                        </Title>
                        {isNPOConfirmed && (
                            <Space>
                                <Button
                                    icon={<AppstoreOutlined />}
                                    onClick={() => navigate("/manage-events")}
                                >
                                    Управление событиями
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateEvent}
                                >
                                    Создать событие
                                </Button>
                            </Space>
                        )}
                    </Flex>

                    {/* Фильтр по тегам */}
                    <div style={{ marginBottom: 24 }}>
                        <Text strong style={{ marginRight: 8, display: "block", marginBottom: 8 }}>Фильтр по тегам:</Text>
                        <Space wrap>
                            <Select
                                mode="multiple"
                                placeholder="Выберите теги для фильтрации"
                                style={{ width: 400 }}
                                value={selectedTagsFilter}
                                onChange={setSelectedTagsFilter}
                                allowClear
                                loading={!eventTags.length}
                            >
                                {eventTags.map((tag) => (
                                    <Option key={tag} value={tag}>
                                        <Tag color={getTagColor(tag)}>{tag}</Tag>
                                    </Option>
                                ))}
                            </Select>
                            {selectedTagsFilter.length > 0 && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setSelectedTagsFilter([])}
                                >
                                    Очистить фильтр
                                </Button>
                            )}
                        </Space>
                    </div>

                    <div className="events-page__content">
                        <div className="events-page__calendar-wrapper">
                            <Calendar
                                value={selectedDate}
                                onChange={setSelectedDate}
                                mode={mode}
                                onPanelChange={(date, newMode) => {
                                    // Блокируем переход в режим года, оставляем только месяц
                                    if (newMode === "month") {
                                        setMode("month");
                                        setSelectedDate(date);
                                    }
                                }}
                                headerRender={headerRender}
                                cellRender={cellRender}
                                className="events-calendar"
                            />
                        </div>

                        <div className="events-page__events-panel">
                            <Title level={4} className="events-page__events-title">
                                События на{" "}
                                {selectedDate.locale("ru").format("D MMMM YYYY")}
                            </Title>

                            {selectedDateEvents.length === 0 ? (
                                <Empty
                                    description="На эту дату событий нет"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : (
                                <List
                                    dataSource={selectedDateEvents}
                                    renderItem={(event: IEvent) => (
                                        <List.Item className="events-page__event-item">
                                            <Card
                                                size="small"
                                                className="events-page__event-card"
                                                styles={{ body: { padding: 12 } }}
                                            >
                                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                                    <Space align="center" wrap>
                                                        <Title level={5} style={{ margin: 0 }}>
                                                            {event.name}
                                                        </Title>
                                                        <FavoriteButton itemType="event" itemId={event.id} size="small" />
                                                    </Space>
                                                    {event.tags && event.tags.length > 0 && (
                                                        <Space wrap size={[4, 4]} style={{ marginTop: 4 }}>
                                                            {event.tags.map((tag) => (
                                                                <Tag key={tag} color={getTagColor(tag)}>
                                                                    {tag}
                                                                </Tag>
                                                            ))}
                                                        </Space>
                                                    )}

                                                    {event.description && (
                                                        <Paragraph
                                                            ellipsis={{ rows: 2, expandable: "collapsible" }}
                                                            style={{ margin: 0 }}
                                                        >
                                                            {event.description}
                                                        </Paragraph>
                                                    )}

                                                    <Space wrap>
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <Text type="secondary">
                                                            {dayjs(event.start).format("DD.MM.YYYY HH:mm")} -{" "}
                                                            {dayjs(event.end).format("DD.MM.YYYY HH:mm")}
                                                        </Text>
                                                    </Space>
                                                    {(event.address || event.city) && (
                                                        <Space>
                                                            <EnvironmentOutlined />
                                                            <Text type="secondary">
                                                                {event.address || event.city}
                                                            </Text>
                                                        </Space>
                                                    )}
                                                        {event.quantity !== null && event.quantity !== undefined && (
                                                            <Text type="secondary">
                                                                Свободно {event.free_spots ?? event.quantity}/{event.quantity} мест
                                                            </Text>
                                                        )}
                                                    </Space>

                                                    {isVolunteer && event.status === "published" && (
                                                        <div style={{ marginTop: 8 }}>
                                                            {isEventPast(event) ? (
                                                                <Button
                                                                    type="default"
                                                                    disabled
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Событие завершено
                                                                </Button>
                                                            ) : isEventResponded(event.id) ? (
                                                                <Button
                                                                    type="default"
                                                                    danger
                                                                    onClick={() => handleCancelResponse(event.id)}
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Отменить участие
                                                                </Button>
                                                            ) : (event.free_spots !== undefined && event.free_spots === 0) ? (
                                                                <Button
                                                                    type="default"
                                                                    disabled
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Все места заполнены
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    type="primary"
                                                                    onClick={() => handleRespondToEvent(event.id)}
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Откликнуться на событие
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Модальное окно создания события */}
            <Modal
                title="Создать событие"
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                    setCreateAttachedIds([]);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setIsCreateModalOpen(false);
                            createForm.resetFields();
                            setCreateAttachedIds([]);
                        }}
                    >
                        Отмена
                    </Button>,
                    <Button key="draft" onClick={() => handleCreateSubmit("draft")}>
                        Сохранить как черновик
                    </Button>,
                    <Button key="publish" type="primary" onClick={() => handleCreateSubmit("published")}>
                        Опубликовать
                    </Button>,
                ]}
                width={800}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Название"
                        rules={[{ required: true, message: "Введите название события" }]}
                    >
                        <Input placeholder="Название события" />
                    </Form.Item>

                    <Form.Item name="description" label="Описание">
                        <TextArea rows={4} placeholder="Описание события" />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Дата и время"
                        rules={[{ required: true, message: "Выберите дату и время" }]}
                    >
                        <RangePicker
                            showTime
                            format="DD.MM.YYYY HH:mm"
                            style={{ width: "100%" }}
                            placeholder={["Начало", "Окончание"]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="Город"
                        rules={[{ required: true, message: "Выберите город проведения события" }]}
                        initialValue={npoData?.city}
                    >
                        <Select
                            placeholder="Выберите город"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={availableCities.map((city) => ({
                                label: city,
                                value: city,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Адрес"
                        help="Введите адрес места проведения события"
                    >
                        <Input placeholder="Например: г. Москва, ул. Ленина, д. 10" />
                    </Form.Item>

                    <Form.Item 
                        name="quantity" 
                        label="Количество участников"
                        rules={[{ required: true, message: "Укажите количество участников" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} placeholder="Количество" />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Теги"
                        help="Выберите один или несколько тегов"
                        rules={[
                            { 
                                required: true, 
                                message: "Выберите хотя бы один тег" 
                            },
                            {
                                validator: (_, value) => {
                                    if (!value || value.length === 0) {
                                        return Promise.reject(new Error("Выберите хотя бы один тег"));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Выберите теги"
                            style={{ width: "100%" }}
                            loading={!eventTags.length}
                        >
                            {eventTags.map((tag) => (
                                <Option key={tag} value={tag}>
                                    {tag}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Изображения события">
                        <Upload
                            beforeUpload={async (file) => {
                                try {
                                    setCreateUploading(true);
                                    const result = await uploadFile(file).unwrap();
                                    setCreateAttachedIds((prev) => [...prev, result.id]);
                                    message.success("Изображение успешно загружено");
                                    return false;
                                } catch (error) {
                                    message.error("Ошибка при загрузке изображения");
                                    return false;
                                } finally {
                                    setCreateUploading(false);
                                }
                            }}
                            showUploadList={false}
                            accept="image/*"
                            multiple
                        >
                            <Button icon={<UploadOutlined />} loading={createUploading} disabled={createUploading}>
                                Загрузить изображения
                            </Button>
                        </Upload>
                        {createAttachedIds.length > 0 && (
                            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                {createAttachedIds.map((fileId) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                        <div style={{ position: "relative" }}>
                                            <FilePreview fileId={fileId} />
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                style={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                }}
                                                onClick={() => setCreateAttachedIds((prev) => prev.filter((id) => id !== fileId))}
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EventsPage;

