import { Card, Typography, Tag, Space, List, Badge, Empty, Tooltip, Button } from "antd";
import type { BadgeProps } from "antd";
import { Calendar } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useGetEventsQuery } from "@services/api/events.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo, useState } from "react";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;

const EventsPage = () => {
    const { data: events, isLoading } = useGetEventsQuery();
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [mode, setMode] = useState<"month" | "year">("month");

    // Группируем события по датам
    const eventsByDate = useMemo(() => {
        if (!events) return new Map<string, IEvent[]>();

        const map = new Map<string, IEvent[]>();
        events.forEach((event) => {
            const eventDate = dayjs(event.start).format("YYYY-MM-DD");
            if (!map.has(eventDate)) {
                map.set(eventDate, []);
            }
            map.get(eventDate)!.push(event);
        });
        return map;
    }, [events]);

    // Получаем события для выбранной даты
    const selectedDateEvents = useMemo(() => {
        const dateKey = selectedDate.format("YYYY-MM-DD");
        return eventsByDate.get(dateKey) || [];
    }, [selectedDate, eventsByDate]);

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
                                    {dayjs(event.start).format("HH:mm")} -{" "}
                                    {dayjs(event.end).format("HH:mm")}
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

    return (
        <div className="events-page">
            <div className="events-page__container">
                <Card className="events-page__card" loading={isLoading}>
                    <Title level={3} className="events-page__title">
                        Календарь событий
                    </Title>

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
                                                                {dayjs(event.start).format("HH:mm")} -{" "}
                                                                {dayjs(event.end).format("HH:mm")}
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

