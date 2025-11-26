import { Card, Row, Col, Typography, Button, Flex, Calendar, Badge, Tooltip, Empty, List, Tag, Space } from "antd";
import type { BadgeProps } from "antd";
import {
    EnvironmentOutlined,
    TeamOutlined,
    CalendarOutlined,
    ReadOutlined,
    ArrowRightOutlined,
    NotificationOutlined,
    PlayCircleOutlined,
    LeftOutlined,
    RightOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { NavLink } from "react-router-dom";
import { useGetEventsQuery } from "@services/api/events.api";
import { useRegisterEventViewMutation } from "@services/api/npo.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo, useState, useEffect } from "react";
import { useCity } from "@hooks/useCity";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";

const { Title, Paragraph, Text } = Typography;

import "./styles.scss";

const HomePage = () => {
    const { currentCity } = useCity();
    const { data: events } = useGetEventsQuery(currentCity);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [mode, setMode] = useState<"month" | "year">("month");
    const [registerEventView] = useRegisterEventViewMutation();
    const features = [
        {
            icon: <EnvironmentOutlined />,
            title: "Карта",
            description: "Найти организации по городу и направлению деятельности",
            link: "map",
        },
        {
            icon: <TeamOutlined />,
            title: "НКО",
            description: "Узнать о волонтёрских проектах в вашем городе",
            link: "npo",
        },
        {
            icon: <CalendarOutlined />,
            title: "Календарь",
            description: "Отметьте интересные события, чтобы ничего не пропустить",
            link: "events",
        },
        {
            icon: <ReadOutlined />,
            title: "База знаний",
            description: "Просматривайте видео и материалы для скачивания",
            link: "knowledges",
        },
        {
            icon: <NotificationOutlined />,
            title: "Новости",
            description: "Будьте в курсе последних инициатив и грантов",
            link: "news",
        },
    ];

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

    // Функция для получения текстового статуса события
    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            published: "Опубликовано",
            draft: "Черновик",
            cancelled: "Отменено",
            completed: "Завершено",
        };
        return labels[status] || status;
    };

    // Кастомный заголовок календаря
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
                <Button type="text" onClick={onToday} className="events-calendar__header-title">
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
                    <Tooltip title={`Еще ${dayEvents.length - 3} событий`} placement="top">
                        <span className="events-calendar__more-indicator">
                            +{dayEvents.length - 3}
                        </span>
                    </Tooltip>
                )}
            </div>
        );
    };

    return (
        <div className="home__container">
            <Card className="home__header">
                <Row gutter={[32, 32]} align="middle">
                    <Col xs={24} md={14}>
                        <Title level={1} className="home__header__title">
                            Добрые дела Росатома
                        </Title>
                        <Title level={3} className="home__header__subheading">Все инициативы вашего города в одном месте</Title>
                        <Paragraph className="home__header__description">
                            Единый портал для жителей, волонтёров и НКО, где собрана вся информация
                            о социальных, экологических, культурных, образовательных и спортивных
                            инициативах в городах присутствия Росатома.
                        </Paragraph>

                        <Title level={4} className="home__header__subtitle">
                            Станьте частью добрых дел в вашем городе!
                        </Title>
                    </Col>

                    <Col xs={24} md={10}>
                        <img
                            src="/images/home.jpg"
                            alt="Волонтёры"
                            className="home__header__image"
                        />
                    </Col>
                </Row>
            </Card>

            <Title level={2} className="home__section-title" style={{ textAlign: "center", marginBottom: 32 }}>
                Здесь вы сможете:
            </Title>

            <Row gutter={[16, 16]} className="home__features">
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                            hoverable
                            className="home__feature-card"
                            actions={[
                                <NavLink to={feature.link}>
                                    <Button type="link" icon={<ArrowRightOutlined />}>
                                        Перейти
                                    </Button>
                                </NavLink>,
                            ]}
                        >
                            <Card.Meta
                                avatar={<div className="home__feature-avatar">{feature.icon}</div>}
                                title={feature.title}
                                description={feature.description}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card
                title={
                    <Flex align="center" gap={8}>
                        <CalendarOutlined />
                        Ближайшие события
                    </Flex>
                }
                className="home__events"
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={14} lg={15}>
                        <Calendar
                            value={selectedDate}
                            onChange={setSelectedDate}
                            mode={mode}
                            onPanelChange={(date, newMode) => {
                                if (newMode === "month") {
                                    setMode("month");
                                    setSelectedDate(date);
                                }
                            }}
                            headerRender={headerRender}
                            cellRender={cellRender}
                            className="events-calendar"
                        />
                    </Col>
                    <Col xs={24} md={10} lg={9}>
                        <div className="home__events-panel">
                            <Title level={4} className="home__events-title">
                                События на {selectedDate.locale("ru").format("D MMMM YYYY")}
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
                                        <List.Item className="home__event-item">
                                            <Card size="small" className="home__event-card" styles={{ body: { padding: 12 } }}>
                                                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                                    <Flex justify="space-between" align="flex-start">
                                                        <div style={{ flex: 1 }}>
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
                                                        <FavoriteButton itemType="event" itemId={event.id} size="small" />
                                                    </Flex>

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
                                                        {event.coordinates && (
                                                            <Space>
                                                                <EnvironmentOutlined />
                                                                <Text type="secondary">
                                                                    {event.coordinates[0].toFixed(4)},{" "}
                                                                    {event.coordinates[1].toFixed(4)}
                                                                </Text>
                                                            </Space>
                                                        )}
                                                        {event.quantity !== null && event.quantity !== undefined && (
                                                            <Text type="secondary">
                                                                Свободно {event.free_spots ?? event.quantity}/{event.quantity} мест
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
                    </Col>
                </Row>
                <NavLink to="/events">
                    <Button type="primary" className="home__events__view-all" block>
                        Смотреть все события
                    </Button>
                </NavLink>
            </Card>

            <Card
                title={
                    <Flex align="center" gap={8}>
                        <PlayCircleOutlined />
                        Быстрый старт
                    </Flex>
                }
            >
                <Paragraph strong>Начните делать добрые дела уже сегодня!</Paragraph>
                <Paragraph>
                    Выберите подходящий способ участия и присоединяйтесь к сообществу волонтёров и
                    активистов вашего города.
                </Paragraph>

                <Flex vertical gap={12} className="home__quick-actions">
                    <NavLink to="/npo">
                        <Button type="primary" size="large" icon={<TeamOutlined />} block>
                            Стать волонтёром
                        </Button>
                    </NavLink>
                    <NavLink to="/map">
                        <Button size="large" icon={<EnvironmentOutlined />} block>
                            Найти организации на карте
                        </Button>
                    </NavLink>
                    <NavLink to="/knowledges">
                        <Button size="large" icon={<ReadOutlined />} block>
                            Изучить материалы
                        </Button>
                    </NavLink>
                </Flex>
            </Card>
        </div>
    );
};

export default HomePage;
