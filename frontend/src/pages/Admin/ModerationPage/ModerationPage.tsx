import { useState } from "react";
import { Card, Tabs, Typography, Table, Space, Button, Tag, Modal, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckOutlined, CloseOutlined, DeleteOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import {
    useGetUnconfirmedNPOsQuery,
    useUpdateNPOStatusMutation,
    useDeleteNPOMutation,
    useDeleteEventMutation,
} from "@services/api/admin.api";
import { useGetEventsQuery } from "@services/api/events.api";
import { useGetNewsQuery, useDeleteNewsMutation } from "@services/api/news.api";

import type { INPO } from "@app-types/npo.types";
import type { IEvent } from "@app-types/events.types";
import type { INews } from "@app-types/news.types";

import "./styles.scss";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const ModerationPage = () => {
    const navigate = useNavigate();
    const { notification } = App.useApp();
    const [activeTab, setActiveTab] = useState("npo");

    // NPO queries
    const { data: unconfirmedNPOs, isLoading: isLoadingNPOs } = useGetUnconfirmedNPOsQuery();
    const [updateNPOStatus] = useUpdateNPOStatusMutation();
    const [deleteNPO] = useDeleteNPOMutation();

    // Events queries - для админа показываем все события без фильтрации по городу
    const { data: events, isLoading: isLoadingEvents } = useGetEventsQuery(undefined);
    const [deleteEvent] = useDeleteEventMutation();

    // News queries - для админа показываем все новости без фильтрации по городу
    const { data: news, isLoading: isLoadingNews } = useGetNewsQuery(undefined);
    const [deleteNews] = useDeleteNewsMutation();

    // NPO columns
    const npoColumns: ColumnsType<INPO> = [
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
            width: 200,
            ellipsis: true,
            render: (name: string) => <Text strong title={name}>{name}</Text>,
        },
        {
            title: "Описание",
            dataIndex: "description",
            key: "description",
            width: 300,
            render: (description: string | null) => (
                <Paragraph
                    style={{ margin: 0, fontSize: "13px" }}
                    ellipsis={{ rows: 2, expandable: "collapsible" }}
                >
                    {description || "Нет описания"}
                </Paragraph>
            ),
        },
        {
            title: "Город",
            dataIndex: "city",
            key: "city",
            width: 150,
        },
        {
            title: "Адрес",
            dataIndex: "address",
            key: "address",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Теги",
            dataIndex: "tags",
            key: "tags",
            width: 300,
            render: (tags: string[]) => (
                <Space wrap size={[4, 4]} style={{ maxWidth: "100%" }}>
                    {tags.slice(0, 3).map((tag, index) => (
                        <Tag
                            key={index}
                            style={{
                                maxWidth: "280px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                display: "inline-block",
                            }}
                            title={tag}
                        >
                            {tag}
                        </Tag>
                    ))}
                    {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
                </Space>
            ),
        },
        {
            title: "Дата регистрации",
            dataIndex: "created_at",
            key: "created_at",
            width: 150,
            render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 150,
            fixed: "right",
            render: (_: any, record: INPO) => (
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApproveNPO(record.id)}
                        size="small"
                        block
                    >
                        Подтвердить
                    </Button>
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleRejectNPO(record.id)}
                        size="small"
                        block
                    >
                        Отклонить
                    </Button>
                </Space>
            ),
        },
    ];

    // Events columns
    const eventsColumns: ColumnsType<IEvent> = [
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: "Описание",
            dataIndex: "description",
            key: "description",
            width: 300,
            render: (description: string | null) => (
                <Paragraph
                    style={{ margin: 0, fontSize: "13px" }}
                    ellipsis={{ rows: 2, expandable: "collapsible" }}
                >
                    {description || "Нет описания"}
                </Paragraph>
            ),
        },
        {
            title: "Начало",
            dataIndex: "start",
            key: "start",
            width: 150,
            render: (date: string) => new Date(date).toLocaleString("ru-RU"),
        },
        {
            title: "Конец",
            dataIndex: "end",
            key: "end",
            width: 150,
            render: (date: string) => new Date(date).toLocaleString("ru-RU"),
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => {
                const statusMap: Record<string, { color: string; label: string }> = {
                    published: { color: "green", label: "Опубликовано" },
                    draft: { color: "default", label: "Черновик" },
                    cancelled: { color: "red", label: "Отменено" },
                    completed: { color: "blue", label: "Завершено" },
                };
                const statusInfo = statusMap[status] || { color: "default", label: status };
                return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
            },
        },
        {
            title: "Действия",
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_: any, record: IEvent) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteEvent(record.id, record.name)}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    // News columns
    const newsColumns: ColumnsType<INews> = [
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: "Текст",
            dataIndex: "text",
            key: "text",
            width: 300,
            render: (text: string) => (
                <Paragraph
                    style={{ margin: 0, fontSize: "13px" }}
                    ellipsis={{ rows: 2, expandable: "collapsible" }}
                >
                    {text}
                </Paragraph>
            ),
        },
        {
            title: "Тип",
            dataIndex: "type",
            key: "type",
            width: 100,
            render: (type: string) => {
                const typeMap: Record<string, { color: string; label: string }> = {
                    blog: { color: "blue", label: "Блог" },
                    edu: { color: "green", label: "Обучение" },
                    docs: { color: "orange", label: "Документы" },
                };
                const typeInfo = typeMap[type] || { color: "default", label: type };
                return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
            },
        },
        {
            title: "Теги",
            dataIndex: "tags",
            key: "tags",
            width: 200,
            render: (tags: string[]) => (
                <Space wrap size={[4, 4]}>
                    {tags.slice(0, 3).map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                    ))}
                    {tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
                </Space>
            ),
        },
        {
            title: "Дата создания",
            dataIndex: "created_at",
            key: "created_at",
            width: 150,
            render: (date: string) => new Date(date).toLocaleDateString("ru-RU"),
        },
        {
            title: "Действия",
            key: "actions",
            width: 120,
            fixed: "right",
            render: (_: any, record: INews) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteNews(record.id, record.name)}
                >
                    Удалить
                </Button>
            ),
        },
    ];

    const handleApproveNPO = async (npoId: number) => {
        try {
            await updateNPOStatus({ npoId, status: "confirmed" }).unwrap();
            notification.success({
                message: "НКО подтверждена",
                description: "НКО успешно переведена в статус подтверждена",
            });
        } catch (error) {
            notification.error({
                message: "Ошибка",
                description: "Не удалось подтвердить НКО",
            });
        }
    };

    const handleRejectNPO = (npoId: number) => {
        confirm({
            title: "Отклонить регистрацию НКО?",
            icon: <ExclamationCircleOutlined />,
            content: "Это действие удалит учетную запись НКО. Это действие нельзя отменить.",
            okText: "Да, удалить",
            okType: "danger",
            cancelText: "Отмена",
            onOk: async () => {
                try {
                    await deleteNPO(npoId).unwrap();
                    notification.success({
                        message: "НКО удалена",
                        description: "Учетная запись НКО успешно удалена",
                    });
                } catch (error) {
                    notification.error({
                        message: "Ошибка",
                        description: "Не удалось удалить НКО",
                    });
                }
            },
        });
    };

    const handleDeleteEvent = (eventId: number, eventName: string) => {
        confirm({
            title: "Удалить событие?",
            icon: <ExclamationCircleOutlined />,
            content: `Вы уверены, что хотите удалить событие "${eventName}"? Это действие нельзя отменить.`,
            okText: "Да, удалить",
            okType: "danger",
            cancelText: "Отмена",
            onOk: async () => {
                try {
                    await deleteEvent(eventId).unwrap();
                    notification.success({
                        message: "Событие удалено",
                        description: "Событие успешно удалено",
                    });
                } catch (error) {
                    notification.error({
                        message: "Ошибка",
                        description: "Не удалось удалить событие",
                    });
                }
            },
        });
    };

    const handleDeleteNews = (newsId: number, newsName: string) => {
        confirm({
            title: "Удалить новость?",
            icon: <ExclamationCircleOutlined />,
            content: `Вы уверены, что хотите удалить новость "${newsName}"? Это действие нельзя отменить.`,
            okText: "Да, удалить",
            okType: "danger",
            cancelText: "Отмена",
            onOk: async () => {
                try {
                    await deleteNews(newsId).unwrap();
                    notification.success({
                        message: "Новость удалена",
                        description: "Новость успешно удалена",
                    });
                } catch (error) {
                    notification.error({
                        message: "Ошибка",
                        description: "Не удалось удалить новость",
                    });
                }
            },
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/")}
                    style={{ marginBottom: 16, padding: 0 }}
                >
                    Назад на главную
                </Button>
                <Title level={2} style={{ marginBottom: 24 }}>
                    Модерация
                </Title>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane
                        tab={
                            <span>
                                Неподтверждённые НКО{" "}
                                {unconfirmedNPOs && unconfirmedNPOs.length > 0 && (
                                    <Tag color="red">{unconfirmedNPOs.length}</Tag>
                                )}
                            </span>
                        }
                        key="npo"
                    >
                        <Table
                            columns={npoColumns}
                            dataSource={(unconfirmedNPOs || []).map((item) => ({ ...item, key: item.id }))}
                            loading={isLoadingNPOs}
                            scroll={{ x: 1450 }}
                            pagination={{ pageSize: 10 }}
                            tableLayout="fixed"
                        />
                    </TabPane>
                    <TabPane tab="События" key="events">
                        <Table
                            columns={eventsColumns}
                            dataSource={(events || []).map((item) => ({ ...item, key: item.id }))}
                            loading={isLoadingEvents}
                            scroll={{ x: 1200 }}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                    <TabPane tab="Новости" key="news">
                        <Table
                            columns={newsColumns}
                            dataSource={(news || []).map((item) => ({ ...item, key: item.id }))}
                            loading={isLoadingNews}
                            scroll={{ x: 1200 }}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default ModerationPage;

