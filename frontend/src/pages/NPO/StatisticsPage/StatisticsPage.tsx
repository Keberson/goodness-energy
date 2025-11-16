import { Card, Statistic, Row, Col, Table, Typography, Tag, Space, Spin } from "antd";
import {
    EyeOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useGetNPOStatisticsQuery } from "@services/api/npo.api";
import { useGetNPOByIdQuery } from "@services/api/npo.api";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";
import type { IProfileViewerStats, IEventStats } from "@app-types/npo.types";

const { Title } = Typography;

const StatisticsPage = () => {
    const userId = useAppSelector((state) => state.auth.userId);
    const { data: npoData } = useGetNPOByIdQuery(userId ?? skipToken);
    const { data: statistics, isLoading } = useGetNPOStatisticsQuery(npoData?.id ?? skipToken);

    const viewerColumns: ColumnsType<IProfileViewerStats> = [
        {
            title: "Пользователь",
            dataIndex: "viewer_login",
            key: "viewer_login",
            render: (login: string | null) => login || "Неавторизованный пользователь",
        },
        {
            title: "Количество просмотров",
            dataIndex: "view_count",
            key: "view_count",
            sorter: (a, b) => a.view_count - b.view_count,
            defaultSortOrder: "descend",
        },
        {
            title: "Последний просмотр",
            dataIndex: "last_viewed_at",
            key: "last_viewed_at",
            render: (date: string | null) => (date ? new Date(date).toLocaleString("ru-RU") : "-"),
        },
    ];

    const eventColumns: ColumnsType<IEventStats> = [
        {
            title: "Название события",
            dataIndex: "event_name",
            key: "event_name",
        },
        {
            title: "Просмотры",
            dataIndex: "view_count",
            key: "view_count",
            sorter: (a, b) => a.view_count - b.view_count,
            defaultSortOrder: "descend",
        },
        {
            title: "Отклики",
            dataIndex: "response_count",
            key: "response_count",
            sorter: (a, b) => a.response_count - b.response_count,
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusConfig: Record<string, { label: string; color: string }> = {
                    draft: { label: "Черновик", color: "default" },
                    published: { label: "Опубликовано", color: "success" },
                    cancelled: { label: "Отменено", color: "error" },
                    completed: { label: "Завершено", color: "processing" },
                };
                const config = statusConfig[status] || { label: status, color: "default" };
                return <Tag color={config.color}>{config.label}</Tag>;
            },
        },
        {
            title: "Дата создания",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
        },
    ];

    if (isLoading) {
        return (
            <div style={{ padding: 24, textAlign: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!statistics) {
        return (
            <div style={{ padding: 24 }}>
                <Card>
                    <Title level={2}>Статистика</Title>
                    <Typography.Text type="secondary">Данные не найдены</Typography.Text>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Title level={2} style={{ marginBottom: 24 }}>
                    Статистика организации
                </Title>

                {/* Общая статистика */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Всего просмотров профиля"
                                value={statistics.total_profile_views}
                                prefix={<EyeOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Уникальных посетителей"
                                value={statistics.unique_viewers}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Всего событий"
                                value={statistics.total_events}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Всего откликов"
                                value={statistics.total_event_responses}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Статистика по статусам событий */}
                <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>События по статусам</Title>
                    <Space wrap>
                        {Object.entries(statistics.events_by_status).map(([status, count]) => {
                            const statusConfig: Record<string, { label: string; color: string }> = {
                                draft: { label: "Черновик", color: "default" },
                                published: { label: "Опубликовано", color: "success" },
                                cancelled: { label: "Отменено", color: "error" },
                                completed: { label: "Завершено", color: "processing" },
                            };
                            const config = statusConfig[status] || {
                                label: status,
                                color: "default",
                            };
                            return (
                                <Tag key={status} color={config.color}>
                                    {config.label}: {count}
                                </Tag>
                            );
                        })}
                    </Space>
                </Card>

                {/* Статистика просмотров профиля */}
                <Card style={{ marginBottom: 24 }}>
                    <Title level={4}>Просмотры профиля</Title>
                    <Table
                        columns={viewerColumns}
                        dataSource={statistics.profile_viewers}
                        rowKey={(record) => record.viewer_id || `anonymous-${record.view_count}`}
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: "Просмотров пока нет" }}
                    />
                </Card>

                {/* Статистика по событиям */}
                <Card>
                    <Title level={4}>Статистика событий</Title>
                    <Table
                        columns={eventColumns}
                        dataSource={statistics.event_stats}
                        rowKey="event_id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: "Событий пока нет" }}
                    />
                </Card>
            </Card>
        </div>
    );
};

export default StatisticsPage;
