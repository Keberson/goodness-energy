import {
    Card,
    Statistic,
    Row,
    Col,
    Table,
    Typography,
    Tag,
    Space,
    Spin,
    Button,
    Dropdown,
    message,
} from "antd";
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ArrowLeftOutlined,
    DownloadOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getApiBaseUrl } from "@utils/apiUrl";
import type { MenuProps } from "antd";

import { useGetNPOStatisticsQuery, useGetNPOByIdQuery } from "@services/api/npo.api";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router-dom";
import React from "react";
import type { IEventStats } from "@app-types/npo.types";

const { Title } = Typography;

const StatisticsPage = () => {
    const navigate = useNavigate();
    const userId = useAppSelector((state) => state.auth.userId);
    const { data: npoData } = useGetNPOByIdQuery(userId ?? skipToken);
    const { data: statistics, isLoading } = useGetNPOStatisticsQuery(npoData?.id ?? skipToken);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownload = async (format: "csv" | "pdf") => {
        if (!npoData?.id) {
            message.error("Не удалось определить ID организации");
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                message.error("Требуется авторизация");
                return;
            }

            const endpoint = format === "csv" ? "csv" : "pdf";
            const apiUrl = `${getApiBaseUrl()}/npo/${npoData.id}/analytics/export/${endpoint}`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const filename = `npo_${npoData.id}_analytics_${
                new Date().toISOString().split("T")[0]
            }.${format}`;

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success(`Аналитика успешно скачана в формате ${format.toUpperCase()}`);
        } catch (error) {
            console.error("Ошибка при скачивании аналитики:", error);
            message.error("Не удалось скачать аналитику");
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadMenuItems: MenuProps["items"] = [
        {
            key: "csv",
            label: "CSV (Сырые данные)",
            icon: <FileExcelOutlined />,
            onClick: () => handleDownload("csv"),
            disabled: isDownloading,
        },
        {
            key: "pdf",
            label: "PDF (Графики и статистика)",
            icon: <FilePdfOutlined />,
            onClick: () => handleDownload("pdf"),
            disabled: isDownloading,
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
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/org")}
                    style={{ marginBottom: 16, padding: 0 }}
                >
                    Назад в профиль НКО
                </Button>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >
                    <Title level={2} style={{ margin: 0 }}>
                        Статистика организации
                    </Title>
                    <Dropdown menu={{ items: downloadMenuItems }} placement="bottomRight">
                        <Button type="primary" icon={<DownloadOutlined />} loading={isDownloading}>
                            Скачать аналитику
                        </Button>
                    </Dropdown>
                </div>

                {/* Общая статистика */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
