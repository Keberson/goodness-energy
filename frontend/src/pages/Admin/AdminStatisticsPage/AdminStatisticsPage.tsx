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
    Tabs,
    Input,
    DatePicker,
    Button,
    Modal,
    message,
} from "antd";
import {
    EyeOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ShopOutlined,
    FileTextOutlined,
    SearchOutlined,
    DownloadOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useGetAllNPOStatisticsQuery } from "@services/api/admin.api";
import { useGetNPOEventsQuery } from "@services/api/npo.api";
import type { INPOStatisticsItem } from "@app-types/npo.types";
import { useMemo, useState } from "react";
import { Column, Line } from "@ant-design/charts";
import { getApiBaseUrl } from "@utils/apiUrl";

const { Title } = Typography;

const AdminStatisticsPage = () => {
    const [searchText, setSearchText] = useState<string>("");
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [selectedNPOId, setSelectedNPOId] = useState<number | null>(null);
    const [eventsModalVisible, setEventsModalVisible] = useState(false);

    const { data: statistics, isLoading } = useGetAllNPOStatisticsQuery({
        startDate: startDate?.format("YYYY-MM-DD"),
        endDate: endDate?.format("YYYY-MM-DD"),
    });

    const { data: npoEvents, isLoading: eventsLoading } = useGetNPOEventsQuery(
        selectedNPOId ?? 0,
        { skip: !selectedNPOId || !eventsModalVisible }
    );

    // Фильтрация НКО по поисковому запросу
    const filteredNPOStatistics = useMemo(() => {
        if (!statistics?.npo_statistics) return [];
        if (!searchText.trim()) return statistics.npo_statistics;
        
        const searchLower = searchText.toLowerCase();
        return statistics.npo_statistics.filter((npo) =>
            npo.npo_name.toLowerCase().includes(searchLower)
        );
    }, [statistics?.npo_statistics, searchText]);

    const npoTableColumns: ColumnsType<INPOStatisticsItem> = [
        {
            title: "НКО",
            dataIndex: "npo_name",
            key: "npo_name",
            sorter: (a, b) => a.npo_name.localeCompare(b.npo_name, "ru"),
            render: (name: string, record: INPOStatisticsItem) => (
                <Space>
                    <ShopOutlined />
                    <strong>{name}</strong>
                    <Tag color="blue">ID: {record.npo_id}</Tag>
                </Space>
            ),
        },
        {
            title: "Просмотры профиля",
            dataIndex: "total_profile_views",
            key: "total_profile_views",
            sorter: (a, b) => a.total_profile_views - b.total_profile_views,
            defaultSortOrder: "descend",
            render: (value: number) => (
                <Space>
                    <EyeOutlined />
                    {value}
                </Space>
            ),
        },
        {
            title: "Уникальные посетители",
            dataIndex: "unique_viewers",
            key: "unique_viewers",
            sorter: (a, b) => a.unique_viewers - b.unique_viewers,
            render: (value: number) => (
                <Space>
                    <UserOutlined />
                    {value}
                </Space>
            ),
        },
        {
            title: "События",
            dataIndex: "total_events",
            key: "total_events",
            sorter: (a, b) => a.total_events - b.total_events,
            render: (value: number) => (
                <Space>
                    <CalendarOutlined />
                    {value}
                </Space>
            ),
        },
        {
            title: "Новости",
            dataIndex: "total_news",
            key: "total_news",
            sorter: (a, b) => a.total_news - b.total_news,
            render: (value: number) => (
                <Space>
                    <FileTextOutlined />
                    {value}
                </Space>
            ),
        },
        {
            title: "Отклики",
            dataIndex: "total_event_responses",
            key: "total_event_responses",
            sorter: (a, b) => a.total_event_responses - b.total_event_responses,
            render: (value: number) => (
                <Space>
                    <CheckCircleOutlined />
                    {value}
                </Space>
            ),
        },
        {
            title: "События по статусам",
            key: "events_by_status",
            render: (_: any, record: INPOStatisticsItem) => (
                <Space wrap>
                    {Object.entries(record.events_by_status).map(([status, count]) => {
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
            ),
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
                    <Title level={2}>Статистика НКО</Title>
                    <Typography.Text type="secondary">Данные не найдены</Typography.Text>
                </Card>
            </div>
        );
    }

    const handleViewEvents = (npoId: number) => {
        setSelectedNPOId(npoId);
        setEventsModalVisible(true);
    };

    const handleExportPDF = async (npoId?: number) => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                message.error("Требуется авторизация");
                return;
            }

            const endpoint = npoId 
                ? `/admin/statistics/npo/${npoId}/export/pdf`
                : `/admin/statistics/export/pdf`;
            
            // Добавляем параметры дат в URL, если они заданы
            const params = new URLSearchParams();
            if (startDate) {
                params.append("start_date", startDate.format("YYYY-MM-DD"));
            }
            if (endDate) {
                params.append("end_date", endDate.format("YYYY-MM-DD"));
            }
            const queryString = params.toString();
            const apiUrl = `${getApiBaseUrl()}${endpoint}${queryString ? `?${queryString}` : ""}`;

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
            const filename = npoId
                ? `npo_${npoId}_analytics_${new Date().toISOString().split("T")[0]}.pdf`
                : `all_npos_statistics_${new Date().toISOString().split("T")[0]}.pdf`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success(`Отчёт успешно скачан`);
        } catch (error) {
            console.error("Ошибка при экспорте PDF:", error);
            message.error("Ошибка при экспорте PDF");
        }
    };

    const tabItems = [
        {
            key: "overview",
            label: "Общая статистика",
            children: (
                <div>
                    {/* Фильтры по датам */}
                    <Card style={{ marginBottom: 24 }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Title level={5}>Фильтр по датам</Title>
                            <Space>
                                <DatePicker
                                    placeholder="Дата начала"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    format="DD.MM.YYYY"
                                />
                                <DatePicker
                                    placeholder="Дата конца"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    format="DD.MM.YYYY"
                                />
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setStartDate(null);
                                        setEndDate(null);
                                    }}
                                >
                                    Сбросить
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => handleExportPDF()}
                                >
                                    Экспорт PDF
                                </Button>
                            </Space>
                        </Space>
                    </Card>

                    {/* Общая статистика */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Всего НКО"
                                    value={statistics.total_npos}
                                    prefix={<ShopOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Всего просмотров профилей"
                                    value={statistics.total_profile_views}
                                    prefix={<EyeOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Уникальных посетителей"
                                    value={statistics.total_unique_viewers}
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
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="Всего новостей"
                                    value={statistics.total_news}
                                    prefix={<FileTextOutlined />}
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
                        <Title level={4}>События по статусам (все НКО)</Title>
                        <Space wrap style={{ marginBottom: 16 }}>
                            {Object.entries(statistics.total_events_by_status).map(([status, count]) => {
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

                    {/* Графики активности по времени */}
                    {statistics.total_date_statistics && statistics.total_date_statistics.length > 0 && (
                        <>
                            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Title level={4}>Просмотры профиля по времени</Title>
                                        <Line
                                            data={statistics.total_date_statistics.map((item) => ({
                                                date: new Date(item.date).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                }),
                                                value: item.profile_views,
                                            }))}
                                            xField="date"
                                            yField="value"
                                            height={250}
                                            point={{
                                                size: 4,
                                                shape: "circle",
                                            }}
                                            color="#2E86AB"
                                            smooth
                                            label={{
                                                position: "top" as const,
                                                formatter: (datum: any) => {
                                                    // Для Line chart formatter получает объект с полями данных
                                                    const value = datum?.value ?? datum?.y ?? "";
                                                    return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                },
                                            }}
                                            tooltip={{
                                                formatter: (datum: any) => {
                                                    // Для Line chart tooltip получает массив [x, y]
                                                    const yValue = Array.isArray(datum) ? datum[1] : (datum?.value ?? datum?.y ?? 0);
                                                    return {
                                                        name: "Просмотры",
                                                        value: yValue,
                                                    };
                                                },
                                            }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Title level={4}>Просмотры событий по времени</Title>
                                        <Column
                                            data={statistics.total_date_statistics.map((item) => ({
                                                date: new Date(item.date).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                }),
                                                value: item.event_views,
                                            }))}
                                            xField="date"
                                            yField="value"
                                            height={250}
                                            columnStyle={{
                                                fill: "#A23B72",
                                            }}
                                            label={{
                                                position: "top" as const,
                                                offset: 5,
                                                formatter: (datum: any) => {
                                                    const value = datum?.value ?? datum?.y ?? "";
                                                    return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                },
                                            }}
                                            tooltip={{
                                                formatter: (datum: any) => {
                                                    // Для Line chart tooltip получает массив [x, y]
                                                    const yValue = Array.isArray(datum) ? datum[1] : (datum?.value ?? datum?.y ?? 0);
                                                    return {
                                                        name: "Просмотры",
                                                        value: yValue,
                                                    };
                                                },
                                            }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Title level={4}>Отклики по времени</Title>
                                        <Column
                                            data={statistics.total_date_statistics.map((item) => ({
                                                date: new Date(item.date).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                }),
                                                value: item.responses,
                                            }))}
                                            xField="date"
                                            yField="value"
                                            height={250}
                                            columnStyle={{
                                                fill: "#F18F01",
                                            }}
                                            label={{
                                                position: "top" as const,
                                                offset: 5,
                                                formatter: (datum: any) => {
                                                    const value = datum?.value ?? datum?.y ?? "";
                                                    return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                },
                                            }}
                                            tooltip={{
                                                formatter: (datum: any) => {
                                                    // Для Column chart tooltip получает объект с полями данных
                                                    const yValue = datum?.value ?? datum?.y ?? datum?.[1] ?? 0;
                                                    return {
                                                        name: "Отклики",
                                                        value: yValue,
                                                    };
                                                },
                                            }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card>
                                        <Title level={4}>Сводная активность</Title>
                                        <Column
                                            data={statistics.total_date_statistics.flatMap((item) => {
                                                const dateStr = new Date(item.date).toLocaleDateString("ru-RU", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                });
                                                return [
                                                    { date: dateStr, type: "Просмотры профиля", value: item.profile_views },
                                                    { date: dateStr, type: "Просмотры событий", value: item.event_views },
                                                    { date: dateStr, type: "Отклики", value: item.responses },
                                                ];
                                            })}
                                            xField="date"
                                            yField="value"
                                            seriesField="type"
                                            height={250}
                                            isGroup
                                            colorField="type"
                                            color={(type: string) => {
                                                if (type === "Просмотры профиля") return "#2E86AB";
                                                if (type === "Просмотры событий") return "#A23B72";
                                                if (type === "Отклики") return "#F18F01";
                                                return "#1890ff";
                                            }}
                                            label={{
                                                position: "top" as const,
                                                offset: 5,
                                                formatter: (datum: any) => {
                                                    const value = datum?.value ?? datum?.y ?? "";
                                                    return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                },
                                            }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            ),
        },
        {
            key: "npos",
            label: "Статистика по НКО",
            children: (
                <Card>
                    {/* Фильтры по датам */}
                    <Card style={{ marginBottom: 24 }}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Title level={5}>Фильтр по датам</Title>
                            <Space>
                                <DatePicker
                                    placeholder="Дата начала"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    format="DD.MM.YYYY"
                                />
                                <DatePicker
                                    placeholder="Дата конца"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    format="DD.MM.YYYY"
                                />
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setStartDate(null);
                                        setEndDate(null);
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Space>
                        </Space>
                    </Card>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ marginBottom: 16 }}>
                            Детальная статистика по каждой НКО
                        </Title>
                        <Input
                            placeholder="Поиск по названию НКО"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            style={{ maxWidth: 400 }}
                        />
                    </div>
                    <Table
                        columns={npoTableColumns}
                        dataSource={filteredNPOStatistics}
                        rowKey="npo_id"
                        pagination={{ pageSize: 10 }}
                        locale={{ emptyText: searchText ? "НКО не найдены" : "НКО не найдены" }}
                        expandable={{
                            expandedRowRender: (record: INPOStatisticsItem) => {
                                const hasDateData = record.date_statistics && record.date_statistics.length > 0;

                                // График просмотров профиля по времени (линейный график)
                                const profileViewsData = hasDateData
                                    ? record.date_statistics!.map((item) => ({
                                          date: new Date(item.date).toLocaleDateString("ru-RU", {
                                              day: "2-digit",
                                              month: "2-digit",
                                          }),
                                          value: item.profile_views,
                                          category: "Просмотры профиля",
                                      }))
                                    : [];

                                // График просмотров событий по времени (столбчатая диаграмма)
                                const eventViewsData = hasDateData
                                    ? record.date_statistics!.map((item) => ({
                                          date: new Date(item.date).toLocaleDateString("ru-RU", {
                                              day: "2-digit",
                                              month: "2-digit",
                                          }),
                                          value: item.event_views,
                                      }))
                                    : [];

                                // График откликов по времени (столбчатая диаграмма)
                                const responsesData = hasDateData
                                    ? record.date_statistics!.map((item) => ({
                                          date: new Date(item.date).toLocaleDateString("ru-RU", {
                                              day: "2-digit",
                                              month: "2-digit",
                                          }),
                                          value: item.responses,
                                      }))
                                    : [];

                                // Сводный график активности (группированная столбчатая диаграмма)
                                const combinedData = hasDateData
                                    ? record.date_statistics!.flatMap((item) => {
                                          const dateStr = new Date(item.date).toLocaleDateString("ru-RU", {
                                              day: "2-digit",
                                              month: "2-digit",
                                          });
                                          return [
                                              { date: dateStr, type: "Просмотры профиля", value: item.profile_views },
                                              { date: dateStr, type: "Просмотры событий", value: item.event_views },
                                              { date: dateStr, type: "Отклики", value: item.responses },
                                          ];
                                      })
                                    : [];

                                return (
                                    <div style={{ padding: "16px 0" }}>
                                        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                                            <Col span={24}>
                                                <Space>
                                                    <Button
                                                        icon={<CalendarOutlined />}
                                                        onClick={() => handleViewEvents(record.npo_id)}
                                                    >
                                                        Просмотреть мероприятия
                                                    </Button>
                                                    <Button
                                                        type="primary"
                                                        icon={<DownloadOutlined />}
                                                        onClick={() => handleExportPDF(record.npo_id)}
                                                    >
                                                        Экспорт PDF
                                                    </Button>
                                                </Space>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12} md={6}>
                                                <Card size="small" title="Статистика">
                                                    <Row gutter={[16, 16]}>
                                                        <Col xs={24} sm={12}>
                                                            <Statistic
                                                                title="Просмотры профиля"
                                                                value={record.total_profile_views}
                                                                prefix={<EyeOutlined />}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Statistic
                                                                title="Уникальные посетители"
                                                                value={record.unique_viewers}
                                                                prefix={<UserOutlined />}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Statistic
                                                                title="События"
                                                                value={record.total_events}
                                                                prefix={<CalendarOutlined />}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Statistic
                                                                title="Новости"
                                                                value={record.total_news}
                                                                prefix={<FileTextOutlined />}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Statistic
                                                                title="Отклики"
                                                                value={record.total_event_responses}
                                                                prefix={<CheckCircleOutlined />}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                            {hasDateData && (
                                                <>
                                                    <Col xs={24} sm={12} md={9}>
                                                        <Card size="small" title="Просмотры профиля по времени">
                                                            {profileViewsData.length > 0 ? (
                                                                <Line
                                                                    data={profileViewsData}
                                                                    xField="date"
                                                                    yField="value"
                                                                    height={200}
                                                                    point={{
                                                                        size: 4,
                                                                        shape: "circle",
                                                                    }}
                                                                    color="#2E86AB"
                                                                    smooth
                                                                    label={{
                                                                        position: "top" as const,
                                                                        formatter: (datum: any) => {
                                                                            const value = datum?.value ?? datum?.y ?? "";
                                                                            return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                                        },
                                                                    }}
                                                                    tooltip={{
                                                                        formatter: (datum: any) => {
                                                                            return {
                                                                                name: "Просмотры",
                                                                                value: datum.value || datum.y || 0,
                                                                            };
                                                                        },
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography.Text type="secondary">
                                                                    Нет данных
                                                                </Typography.Text>
                                                            )}
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={9}>
                                                        <Card size="small" title="Просмотры событий по времени">
                                                            {eventViewsData.length > 0 ? (
                                                                <Column
                                                                    data={eventViewsData}
                                                                    xField="date"
                                                                    yField="value"
                                                                    height={200}
                                                                    columnStyle={{
                                                                        fill: "#A23B72",
                                                                    }}
                                                                    label={{
                                                                        position: "top" as const,
                                                                        offset: 5,
                                                                        formatter: (datum: any) => {
                                                                            const value = datum?.value ?? datum?.y ?? "";
                                                                            return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                                        },
                                                                    }}
                                                                    tooltip={{
                                                                        formatter: (datum: any) => {
                                                                            return {
                                                                                name: "Просмотры",
                                                                                value: datum.value || datum.y || 0,
                                                                            };
                                                                        },
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography.Text type="secondary">
                                                                    Нет данных
                                                                </Typography.Text>
                                                            )}
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={9}>
                                                        <Card size="small" title="Отклики по времени">
                                                            {responsesData.length > 0 ? (
                                                                <Column
                                                                    data={responsesData}
                                                                    xField="date"
                                                                    yField="value"
                                                                    height={200}
                                                                    columnStyle={{
                                                                        fill: "#F18F01",
                                                                    }}
                                                                    label={{
                                                                        position: "top" as const,
                                                                        offset: 5,
                                                                        formatter: (datum: any) => {
                                                                            const value = datum?.value ?? datum?.y ?? "";
                                                                            return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                                        },
                                                                    }}
                                                                    tooltip={{
                                                                        formatter: (datum: any) => {
                                                                            return {
                                                                                name: "Отклики",
                                                                                value: datum.value || datum.y || 0,
                                                                            };
                                                                        },
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography.Text type="secondary">
                                                                    Нет данных
                                                                </Typography.Text>
                                                            )}
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={15}>
                                                        <Card size="small" title="Сводная активность">
                                                            {combinedData.length > 0 ? (
                                                                <Column
                                                                    data={combinedData}
                                                                    xField="date"
                                                                    yField="value"
                                                                    seriesField="type"
                                                                    height={200}
                                                                    isGroup
                                                                    colorField="type"
                                                                    color={(type: string) => {
                                                                        if (type === "Просмотры профиля") return "#2E86AB";
                                                                        if (type === "Просмотры событий") return "#A23B72";
                                                                        if (type === "Отклики") return "#F18F01";
                                                                        return "#1890ff";
                                                                    }}
                                                                    label={{
                                                                        position: "top" as const,
                                                                        offset: 5,
                                                                        formatter: (datum: any) => {
                                                                            const value = datum?.value ?? datum?.y ?? "";
                                                                            return value !== "" && value !== undefined && value !== null ? String(value) : "";
                                                                        },
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography.Text type="secondary">
                                                                    Нет данных
                                                                </Typography.Text>
                                                            )}
                                                        </Card>
                                                    </Col>
                                                </>
                                            )}
                                            {!hasDateData && (
                                                <Col xs={24} sm={12} md={18}>
                                                    <Card size="small">
                                                        <Typography.Text type="secondary">
                                                            Данные по датам отсутствуют
                                                        </Typography.Text>
                                                    </Card>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                );
                            },
                        }}
                    />
                </Card>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Title level={2} style={{ marginBottom: 24 }}>
                    Статистика посещаемости НКО
                </Title>
                <Tabs items={tabItems} />
            </Card>

            {/* Модальное окно для просмотра мероприятий */}
            <Modal
                title={`Мероприятия НКО: ${statistics?.npo_statistics.find(n => n.npo_id === selectedNPOId)?.npo_name || ""}`}
                open={eventsModalVisible}
                onCancel={() => {
                    setEventsModalVisible(false);
                    setSelectedNPOId(null);
                }}
                footer={null}
                width={800}
            >
                {eventsLoading ? (
                    <div style={{ textAlign: "center", padding: 24 }}>
                        <Spin size="large" />
                    </div>
                ) : npoEvents && npoEvents.length > 0 ? (
                    <Table
                        dataSource={npoEvents}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        columns={[
                            {
                                title: "Название",
                                dataIndex: "name",
                                key: "name",
                            },
                            {
                                title: "Город",
                                dataIndex: "city",
                                key: "city",
                            },
                            {
                                title: "Начало",
                                dataIndex: "start",
                                key: "start",
                                render: (date: string) => new Date(date).toLocaleString("ru-RU"),
                            },
                            {
                                title: "Конец",
                                dataIndex: "end",
                                key: "end",
                                render: (date: string) => new Date(date).toLocaleString("ru-RU"),
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
                        ]}
                    />
                ) : (
                    <Typography.Text type="secondary">Мероприятия не найдены</Typography.Text>
                )}
            </Modal>
        </div>
    );
};

export default AdminStatisticsPage;

