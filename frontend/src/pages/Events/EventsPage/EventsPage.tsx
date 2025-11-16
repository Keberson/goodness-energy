import { Card, Typography, Tag, Space, List, Badge, Empty, Tooltip, Button, message, Flex } from "antd";
import type { BadgeProps } from "antd";
import { Calendar } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useGetEventsQuery } from "@services/api/events.api";
import { useRegisterEventViewMutation } from "@services/api/npo.api";
import { useGetVolunteerEventsQuery, useRespondToEventMutation } from "@services/api/volunteer.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;

const EventsPage = () => {
    const { data: events, isLoading } = useGetEventsQuery();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [mode, setMode] = useState<"month" | "year">("month");
    const [registerEventView] = useRegisterEventViewMutation();
    
    // Проверка авторизации и получение событий волонтёра
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const userId = useAppSelector((state) => state.auth.userId);
    const isVolunteer = isAuthenticated && userType === "volunteer";
    const isNPO = isAuthenticated && userType === "npo";
    const navigate = useNavigate();
    
    const { data: volunteerEvents } = useGetVolunteerEventsQuery(
        isVolunteer && userId ? userId : skipToken
    );
    const [respondToEvent] = useRespondToEventMutation();
    
    // Создаём Set для быстрой проверки, откликнулся ли волонтёр на событие
    const respondedEventIds = useMemo(() => {
        if (!volunteerEvents) return new Set<number>();
        return new Set(volunteerEvents.map((event) => event.id));
    }, [volunteerEvents]);

    // Группируем события по датам (событие отображается на каждый день от start до end)
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
        return map;
    }, [events]);

    // Получаем события для выбранной даты (события, которые идут в этот день)
    const selectedDateEvents = useMemo(() => {
        const dateStart = selectedDate.startOf("day");
        const dateEnd = selectedDate.endOf("day");
        
        // Фильтруем события, которые пересекаются с выбранной датой
        return (events || []).filter((event) => {
            const eventStart = dayjs(event.start);
            const eventEnd = dayjs(event.end);
            // Событие попадает в выбранный день, если оно начинается до конца дня и заканчивается после начала дня
            return (eventStart.isBefore(dateEnd) || eventStart.isSame(dateEnd)) && 
                   (eventEnd.isAfter(dateStart) || eventEnd.isSame(dateStart));
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

    // Функция для получения статуса события
    const getStatusColor = (status: string): BadgeProps["status"] => {
        const statusMap: Record<string, BadgeProps["status"]> = {
            published: "success",
            draft: "default",
            cancelled: "error",
            completed: "processing",
        };
        return statusMap[status] || "default";
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            published: "Опубликовано",
            draft: "Черновик",
            cancelled: "Отменено",
            completed: "Завершено",
        };
        return labels[status] || status;
    };

    const handleRespondToEvent = async (eventId: number) => {
        if (!isVolunteer) {
            message.warning("Для отклика на событие необходимо авторизоваться как волонтёр");
            return;
        }

        try {
            await respondToEvent(eventId).unwrap();
            message.success("Вы успешно откликнулись на событие!");
        } catch (error: any) {
            if (error?.data?.detail) {
                message.error(error.data.detail);
            } else {
                message.error("Не удалось откликнуться на событие");
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
    const dateCellRender = (value: Dayjs) => {
        const dateKey = value.format("YYYY-MM-DD");
        const dayEvents = eventsByDate.get(dateKey) || [];

        if (dayEvents.length === 0) {
            return null;
        }

        return (
            <div className="events-calendar__events-indicators">
                {dayEvents.slice(0, 3).map((event) => (
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
                            </div>
                        }
                        placement="top"
                    >
                        <Badge
                            status={getStatusColor(event.status)}
                            className="events-calendar__event-indicator"
                        />
                    </Tooltip>
                ))}
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
        navigate("/manage-events?create=true");
    };

    return (
        <div className="events-page">
            <div className="events-page__container">
                <Card className="events-page__card" loading={isLoading}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                        <Title level={3} className="events-page__title" style={{ margin: 0 }}>
                            Календарь событий
                        </Title>
                        {isNPO && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreateEvent}
                            >
                                Создать событие
                            </Button>
                        )}
                    </Flex>

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
                                dateCellRender={dateCellRender}
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
                                            >
                                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                                    <div>
                                                        <Title level={5} style={{ margin: 0 }}>
                                                            {event.name}
                                                        </Title>
                                                        <Tag
                                                            color={
                                                                event.status === "published"
                                                                    ? "green"
                                                                    : event.status === "cancelled"
                                                                    ? "red"
                                                                    : event.status === "completed"
                                                                    ? "blue"
                                                                    : "default"
                                                            }
                                                        >
                                                            {getStatusLabel(event.status)}
                                                        </Tag>
                                                    </div>

                                                    {event.description && (
                                                        <Paragraph
                                                            ellipsis={{ rows: 2, expandable: true }}
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
                                                        {event.coordinates && (
                                                            <Space>
                                                                <EnvironmentOutlined />
                                                                <Text type="secondary">
                                                                    {event.coordinates[0].toFixed(4)},{" "}
                                                                    {event.coordinates[1].toFixed(4)}
                                                                </Text>
                                                            </Space>
                                                        )}
                                                        {event.quantity && (
                                                            <Text type="secondary">
                                                                Участников: {event.quantity}
                                                            </Text>
                                                        )}
                                                    </Space>

                                                    {event.tags && event.tags.length > 0 && (
                                                        <Space wrap>
                                                            {event.tags.map((tag) => (
                                                                <Tag key={tag}>{tag}</Tag>
                                                            ))}
                                                        </Space>
                                                    )}

                                                    {isVolunteer && event.status === "published" && (
                                                        <div style={{ marginTop: 8 }}>
                                                            {isEventResponded(event.id) ? (
                                                                <Button
                                                                    type="default"
                                                                    icon={<CheckCircleOutlined />}
                                                                    disabled
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Вы уже откликнулись
                                                                </Button>
                                                            ) : isEventPast(event) ? (
                                                                <Button
                                                                    type="default"
                                                                    disabled
                                                                    style={{ width: "100%" }}
                                                                >
                                                                    Событие завершено
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
        </div>
    );
};

export default EventsPage;

