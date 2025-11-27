import { Card, Row, Col, Typography, Button, Flex, Empty, List, Tag, Space } from "antd";
import {
    EnvironmentOutlined,
    TeamOutlined,
    CalendarOutlined,
    ReadOutlined,
    ArrowRightOutlined,
    NotificationOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { NavLink, useNavigate } from "react-router-dom";
import { useGetEventsQuery } from "@services/api/events.api";
import { useRegisterEventViewMutation } from "@services/api/npo.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo, useEffect } from "react";
import { useCity } from "@hooks/useCity";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import useAppSelector from "@hooks/useAppSelector";

const { Title, Paragraph, Text } = Typography;

import "./styles.scss";

const HomePage = () => {
    const navigate = useNavigate();
    const { currentCity } = useCity();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const { data: allEvents } = useGetEventsQuery(currentCity);
    // Фильтруем события: показываем только опубликованные и завершённые
    // Сортируем по дате создания (новые первыми)
    const events = useMemo(() => {
        if (!allEvents) return [];
        const filtered = allEvents.filter((event) => 
            event.status === "published" || event.status === "completed"
        );
        // Сортируем по дате создания (новые первыми)
        return filtered.sort((a, b) => {
            const dateA = dayjs(a.created_at).valueOf();
            const dateB = dayjs(b.created_at).valueOf();
            return dateB - dateA; // По убыванию (новые первыми)
        });
    }, [allEvents]);
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
            description: "Просмотреть интересные события, чтобы ничего не пропустить",
            link: "events",
        },
        {
            icon: <ReadOutlined />,
            title: "База знаний",
            description: "Узнать что-то новое",
            link: "knowledges",
        },
        {
            icon: <NotificationOutlined />,
            title: "Новости",
            description: "Увидеть последние новости",
            link: "news",
        },
    ];

    // События на ближайшую неделю
    const upcomingWeekEvents = useMemo(() => {
        const now = dayjs();
        const weekEnd = now.add(7, "day").endOf("day");

        return (events || [])
            .filter((event) => {
                const start = dayjs(event.start);
                return start.isAfter(now) && start.isBefore(weekEnd);
            })
            .sort((a, b) => {
                const startA = dayjs(a.start).valueOf();
                const startB = dayjs(b.start).valueOf();
                return startA - startB; // По возрастанию времени начала
            });
    }, [events]);

    // Регистрируем просмотры для всех событий ближайшей недели
    useEffect(() => {
        if (upcomingWeekEvents.length > 0) {
            upcomingWeekEvents.forEach((event) => {
                registerEventView({
                    npoId: event.npo_id,
                    eventId: event.id,
                }).catch(() => {
                    // Игнорируем ошибки при регистрации просмотра
                });
            });
        }
    }, [upcomingWeekEvents, registerEventView]);

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
                    {isAuthenticated ? (
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={() => {
                                if (userType === "volunteer") {
                                    navigate("/profile");
                                } else if (userType === "npo") {
                                    navigate("/org");
                                } else if (userType === "admin") {
                                    navigate("/moderation");
                                } else {
                                    navigate("/profile");
                                }
                            }}
                        >
                            Войти в личный кабинет
                        </Button>
                    ) : (
                        <Flex gap={12}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                style={{ flex: 1 }}
                                onClick={() => navigate("/login")}
                            >
                                Авторизоваться
                            </Button>
                            <Button
                                size="large"
                                block
                                style={{ flex: 1 }}
                                onClick={() => navigate("/reg")}
                            >
                                Зарегистрироваться
                            </Button>
                        </Flex>
                    )}
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

            <Title
                level={2}
                className="home__section-title"
                style={{ textAlign: "center", marginTop: 32, marginBottom: 32 }}
            >
                Функционал сайта
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
                <div className="home__events-panel">
                    <Title level={4} className="home__events-title">
                        События на ближайшую неделю в городе {currentCity || "вашем городе"}
                    </Title>
                    {upcomingWeekEvents.length === 0 ? (
                        <Empty
                            description="В ближайшую неделю событий нет"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <List
                            dataSource={upcomingWeekEvents}
                            renderItem={(event: IEvent) => (
                                <List.Item className="home__event-item">
                                    <Card size="small" className="home__event-card" styles={{ body: { padding: 12 } }}>
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
                                        </Space>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
                <NavLink to="/events">
                    <Button type="primary" className="home__events__view-all" block>
                        Смотреть все события
                    </Button>
                </NavLink>
            </Card>
        </div>
    );
};

export default HomePage;
