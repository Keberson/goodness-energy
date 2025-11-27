import { Card, Typography, Tag, Space, List, Empty, Button, Popconfirm, App, Tabs } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CloseOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useGetVolunteerEventsQuery, useDeleteEventResponseMutation } from "@services/api/volunteer.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";
import FavoriteButton from "@components/FavoriteButton/FavoriteButton";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;

const MyEventsPage = () => {
    const navigate = useNavigate();
    const userId = useAppSelector((state) => state.auth.userId);
    const { data: events, isLoading } = useGetVolunteerEventsQuery(userId ?? skipToken);
    const [deleteEventResponse] = useDeleteEventResponseMutation();
    const { message } = App.useApp();

    // Делим события на предстоящие и прошедшие
    const { upcomingEvents, pastEvents } = useMemo(() => {
        if (!events) {
            return { upcomingEvents: [] as IEvent[], pastEvents: [] as IEvent[] };
        }

        const now = dayjs();
        const upcoming = events
            .filter((event) => dayjs(event.end).isAfter(now))
            .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

        const past = events
            .filter((event) => dayjs(event.end).isBefore(now) || dayjs(event.end).isSame(now))
            .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf());

        return { upcomingEvents: upcoming, pastEvents: past };
    }, [events]);

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteEventResponse(eventId).unwrap();
            message.success("Участие в событии отменено");
        } catch (error) {
            message.error("Не удалось отменить участие в событии");
        }
    };

    const isEventPast = (event: IEvent): boolean => {
        return dayjs(event.end).isBefore(dayjs());
    };

    // Функция для получения цвета тега (как на главной и в календаре)
    const getTagColor = (tag: string): string => {
        const colors = [
            "red",
            "orange",
            "gold",
            "lime",
            "green",
            "cyan",
            "blue",
            "geekblue",
            "purple",
            "magenta",
            "volcano",
            "geekblue",
            "cyan",
            "blue",
            "purple",
            "magenta",
            "red",
            "orange",
            "gold",
            "lime",
        ];

        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const renderEventsList = (list: IEvent[], isPastTab: boolean) => {
        if (list.length === 0) {
            return (
                <Empty
                    description={isPastTab ? "Прошедших событий пока нет" : "Предстоящих событий пока нет"}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        return (
            <List
                dataSource={list}
                renderItem={(event: IEvent) => (
                    <List.Item className="my-events-page__event-item">
                        <Card
                            size="small"
                            className="my-events-page__event-card"
                            style={{
                                opacity: isEventPast(event) ? 0.7 : 1,
                            }}
                        >
                            <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                                    <Space align="center" wrap>
                                        <Title level={5} style={{ margin: 0 }}>
                                            {event.name}
                                        </Title>
                                        <FavoriteButton itemType="event" itemId={event.id} size="small" />
                                    </Space>
                                    <Space align="center" wrap>
                                        {isEventPast(event) && (
                                            <Tag color="default">
                                                Завершено
                                            </Tag>
                                        )}
                                        {!isEventPast(event) && (
                                            <Popconfirm
                                                title="Отменить участие в событии?"
                                                description="Вы уверены, что хотите отменить участие в этом событии?"
                                                onConfirm={() => handleDeleteEvent(event.id)}
                                                okText="Да"
                                                cancelText="Нет"
                                            >
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<CloseOutlined />}
                                                    size="small"
                                                >
                                                    Отменить участие
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </Space>
                                </Space>

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
                                            {dayjs(event.start).locale("ru").format("DD MMMM YYYY HH:mm")} -{" "}
                                            {dayjs(event.end).locale("ru").format("DD MMMM YYYY HH:mm")}
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
                                    {!isEventPast(event) &&
                                        event.quantity !== null &&
                                        event.quantity !== undefined && (
                                            <Text type="secondary">
                                                Свободно {event.free_spots ?? event.quantity}/{event.quantity} мест
                                            </Text>
                                        )}
                                </Space>

                                {event.tags && event.tags.length > 0 && (
                                    <Space wrap>
                                        {event.tags.map((tag) => (
                                            <Tag key={tag} color={getTagColor(tag)}>
                                                {tag}
                                            </Tag>
                                        ))}
                                    </Space>
                                )}
                            </Space>
                        </Card>
                    </List.Item>
                )}
            />
        );
    };

    return (
        <div className="my-events-page">
            <div className="my-events-page__container">
                <Card className="my-events-page__card" loading={isLoading}>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/profile")}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        Назад в личный кабинет
                    </Button>
                    <Title level={2} className="my-events-page__title">
                        Мои события
                    </Title>

                    {!events || events.length === 0 ? (
                        <Empty
                            description="Вы пока не участвуете ни в одном событии"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <Tabs
                            defaultActiveKey="upcoming"
                            items={[
                                {
                                    key: "upcoming",
                                    label: "Предстоящие",
                                    children: renderEventsList(upcomingEvents, false),
                                },
                                {
                                    key: "past",
                                    label: "Прошедшие",
                                    children: renderEventsList(pastEvents, true),
                                },
                            ]}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyEventsPage;

