import { Card, Typography, Tag, Space, List, Empty, Button, Popconfirm, message } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, CloseOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useGetVolunteerEventsQuery, useDeleteEventResponseMutation } from "@services/api/volunteer.api";
import type { IEvent } from "@app-types/events.types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";
import "./styles.scss";

const { Title, Paragraph, Text } = Typography;

const MyEventsPage = () => {
    const navigate = useNavigate();
    const userId = useAppSelector((state) => state.auth.userId);
    const { data: events, isLoading } = useGetVolunteerEventsQuery(userId ?? skipToken);
    const [deleteEventResponse] = useDeleteEventResponseMutation();

    // Сортируем события: сначала предстоящие, потом прошедшие
    const sortedEvents = useMemo(() => {
        if (!events) return [];
        const now = dayjs();
        const upcoming = events.filter((event) => dayjs(event.end).isAfter(now));
        const past = events.filter((event) => dayjs(event.end).isBefore(now) || dayjs(event.end).isSame(now));
        
        return [
            ...upcoming.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()),
            ...past.sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf()),
        ];
    }, [events]);

    const handleDeleteEvent = async (eventId: number) => {
        try {
            await deleteEventResponse(eventId).unwrap();
            message.success("Участие в событии отменено");
        } catch (error) {
            message.error("Не удалось отменить участие в событии");
        }
    };

    // Функция для получения статуса события
    const getStatusColor = (status: string): string => {
        const statusMap: Record<string, string> = {
            published: "green",
            draft: "default",
            cancelled: "red",
            completed: "blue",
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

    const isEventPast = (event: IEvent): boolean => {
        return dayjs(event.end).isBefore(dayjs());
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

                    {sortedEvents.length === 0 ? (
                        <Empty
                            description="Вы пока не участвуете ни в одном событии"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <List
                            dataSource={sortedEvents}
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
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ flex: 1 }}>
                                                    <Title level={5} style={{ margin: 0 }}>
                                                        {event.name}
                                                    </Title>
                                                    <Tag
                                                        color={getStatusColor(event.status)}
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        {getStatusLabel(event.status)}
                                                    </Tag>
                                                    {isEventPast(event) && (
                                                        <Tag color="default" style={{ marginTop: 4 }}>
                                                            Завершено
                                                        </Tag>
                                                    )}
                                                </div>
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
                                            </div>

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
                </Card>
            </div>
        </div>
    );
};

export default MyEventsPage;

