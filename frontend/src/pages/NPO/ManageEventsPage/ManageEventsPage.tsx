import { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Modal,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Select,
    App,
    Popconfirm,
    Flex,
    Upload,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ru";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCity } from "@hooks/useCity";

import type { IEvent, EventStatus } from "@app-types/events.types";
import {
    useGetNPOEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useUpdateEventStatusMutation,
    type IEventCreateRequest,
    type IEventUpdateRequest,
} from "@services/api/npo.api";
import { useGetNPOByIdQuery } from "@services/api/npo.api";
import { useLazyGeodecodeQuery } from "@services/api/geodecode.api";
import { useUploadFileMutation } from "@services/api/files.api";
import FilePreview from "@components/FilePreview/FilePreview";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ru");

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const statusOptions: { label: string; value: EventStatus; color: string }[] = [
    { label: "Черновик", value: "draft", color: "default" },
    { label: "Опубликовано", value: "published", color: "success" },
    { label: "Отменено", value: "cancelled", color: "error" },
    { label: "Завершено", value: "completed", color: "processing" },
];

const ManageEventsPage = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const userId = useAppSelector((state) => state.auth.userId);
    const { data: npoData } = useGetNPOByIdQuery(userId ?? skipToken);
    const { data: events, isLoading } = useGetNPOEventsQuery(npoData?.id ?? skipToken);
    const [createEvent] = useCreateEventMutation();
    const [updateEvent] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [updateEventStatus] = useUpdateEventStatusMutation();
    const [geodecode] = useLazyGeodecodeQuery();
    const [uploadFile] = useUploadFileMutation();
    const { availableCities } = useCity();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useSearchParams();
    const [attachedIds, setAttachedIds] = useState<number[]>([]);
    const [uploading, setUploading] = useState(false);

    // Проверяем query параметр и открываем модальное окно при необходимости
    useEffect(() => {
        const createParam = searchParams.get("create");
        if (createParam === "true" && npoData) {
            setEditingEvent(null);
            form.resetFields();
            setIsModalOpen(true);
            // Удаляем query параметр из URL
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("create");
            setSearchParams(newSearchParams, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [npoData]);

    const handleCreate = () => {
        setEditingEvent(null);
        setAttachedIds([]);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = async (event: IEvent) => {
        setEditingEvent(event);
        
        // Пытаемся получить адрес из координат через обратное геокодирование
        let address = "";
        if (event.coordinates) {
            try {
                const [lat, lon] = event.coordinates;
                // Yandex Geocoder принимает координаты в формате "lon,lat"
                const reverseGeoResponse = await geodecode(`${lon},${lat}`).unwrap();
                const geoObject = reverseGeoResponse.response.GeoObjectCollection.featureMember[0]?.GeoObject;
                if (geoObject?.metaDataProperty?.GeocoderMetaData?.text) {
                    address = geoObject.metaDataProperty.GeocoderMetaData.text;
                }
            } catch (error) {
                // Если не удалось получить адрес, оставляем пустым
                console.warn("Не удалось получить адрес из координат", error);
            }
        }
        
        form.setFieldsValue({
            name: event.name,
            description: event.description || "",
            dateRange: [dayjs(event.start), dayjs(event.end)],
            address: address,
            quantity: event.quantity,
            tags: event.tags.join(", "),
            status: event.status,
            city: event.city,
        });
        setAttachedIds(event.attachedIds || []);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!npoData || !editingEvent) return;
        try {
            await deleteEvent({ npoId: npoData.id, eventId: editingEvent.id }).unwrap();
            message.success("Событие удалено");
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error("Ошибка при удалении события");
        }
    };

    const handleSubmit = async () => {
        if (!npoData) return;

        try {
            const values = await form.validateFields();
            const [start, end] = values.dateRange as [Dayjs, Dayjs];

            // Преобразуем адрес в координаты через геокодирование
            let coordinates: [number, number] | null = null;
            if (values.address && values.address.trim()) {
                try {
                    const geoResponse = await geodecode(values.address.trim()).unwrap();
                    const geo = geoResponse.response.GeoObjectCollection.featureMember[0]?.GeoObject?.Point?.pos;
                    if (geo) {
                        const [lon, lat] = geo.split(" ").map((item) => Number(item));
                        coordinates = [lat, lon];
                    } else {
                        message.warning("Не удалось найти координаты для указанного адреса");
                    }
                } catch (error) {
                    message.error("Ошибка при геокодировании адреса. Проверьте правильность адреса.");
                    return;
                }
            }

            const tags = values.tags
                ? values.tags
                      .split(",")
                      .map((t: string) => t.trim())
                      .filter((t: string) => t.length > 0)
                : [];

            if (editingEvent) {
                const updateData: IEventUpdateRequest = {
                    name: values.name,
                    description: values.description || null,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    coordinates,
                    quantity: values.quantity || null,
                    tags: tags.length > 0 ? tags : null,
                    city: values.city,
                    attachedIds: attachedIds.length > 0 ? attachedIds : null,
                };
                await updateEvent({
                    npoId: npoData.id,
                    eventId: editingEvent.id,
                    body: updateData,
                }).unwrap();
                
                // Обновляем статус отдельно, если он изменился
                if (values.status && values.status !== editingEvent.status) {
                    await updateEventStatus({
                        npoId: npoData.id,
                        eventId: editingEvent.id,
                        body: { status: values.status },
                    }).unwrap();
                }
                
                message.success("Событие обновлено");
            } else {
                const createData: IEventCreateRequest = {
                    name: values.name,
                    description: values.description || null,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    coordinates,
                    quantity: values.quantity, // Обязательное поле
                    tags: tags.length > 0 ? tags : null,
                    city: values.city,
                    attachedIds: attachedIds.length > 0 ? attachedIds : null,
                };
                await createEvent({ npoId: npoData.id, body: createData }).unwrap();
                message.success("Событие создано");
            }
            setIsModalOpen(false);
            setAttachedIds([]);
            form.resetFields();
        } catch (error: any) {
            if (error?.data?.detail) {
                message.error(error.data.detail);
            } else {
                message.error("Ошибка при сохранении события");
            }
        }
    };

    const columns: ColumnsType<IEvent> = [
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (name: string, record: IEvent) => (
                <Typography.Text
                    onClick={() => handleEdit(record)}
                    style={{
                        cursor: "pointer",
                        color: "#1890ff",
                        fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                    }}
                >
                    {name}
                </Typography.Text>
            ),
        },
        {
            title: "Описание",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
            width: 250,
        },
        {
            title: "Начало",
            key: "start",
            width: 180,
            render: (_, record) => dayjs(record.start).format("DD.MM.YYYY HH:mm"),
        },
        {
            title: "Окончание",
            key: "end",
            width: 180,
            render: (_, record) => dayjs(record.end).format("DD.MM.YYYY HH:mm"),
        },
        {
            title: "Участников",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            render: (quantity) => quantity || "-",
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status: EventStatus) => {
                const statusOption = statusOptions.find((opt) => opt.value === status);
                return (
                    <Tag color={statusOption?.color || "default"}>
                        {statusOption?.label || status}
                    </Tag>
                );
            },
        },
        {
            title: "Теги",
            dataIndex: "tags",
            key: "tags",
            width: 200,
            render: (tags: string[]) => (
                <Space wrap>
                    {tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </Space>
            ),
        },
    ];

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
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={2}>Управление событиями</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Создать событие
                    </Button>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={events}
                    rowKey="id"
                    loading={isLoading}
                    scroll={{ x: 1500 }}
                    pagination={{ pageSize: 10 }}
                />

                <Modal
                    title={editingEvent ? "Редактировать событие" : "Создать событие"}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        form.resetFields();
                        setEditingEvent(null);
                        setAttachedIds([]);
                    }}
                    width={600}
                    style={{ top: 50 }}
                    styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}
                    footer={
                        editingEvent ? (
                            <Flex justify="space-between">
                                <Popconfirm
                                    title="Удалить событие?"
                                    description="Это действие нельзя отменить"
                                    onConfirm={handleDelete}
                                    okText="Да"
                                    cancelText="Нет"
                                >
                                    <Button danger icon={<DeleteOutlined />}>
                                        Удалить
                                    </Button>
                                </Popconfirm>
                                <Space>
                                    <Button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            form.resetFields();
                                            setEditingEvent(null);
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                    <Button type="primary" onClick={handleSubmit}>
                                        Сохранить
                                    </Button>
                                </Space>
                            </Flex>
                        ) : (
                            <Space>
                                <Button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        form.resetFields();
                                        setEditingEvent(null);
                                        setAttachedIds([]);
                                    }}
                                >
                                    Отмена
                                </Button>
                                <Button type="primary" onClick={handleSubmit}>
                                    Создать
                                </Button>
                            </Space>
                        )
                    }
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="name"
                            label="Название"
                            rules={[{ required: true, message: "Введите название события" }]}
                        >
                            <Input placeholder="Название события" />
                        </Form.Item>

                        <Form.Item name="description" label="Описание">
                            <TextArea rows={4} placeholder="Описание события" />
                        </Form.Item>

                        <Form.Item
                            name="dateRange"
                            label="Дата и время"
                            rules={[{ required: true, message: "Выберите дату и время" }]}
                        >
                            <RangePicker
                                showTime
                                format="DD.MM.YYYY HH:mm"
                                style={{ width: "100%" }}
                                placeholder={["Начало", "Окончание"]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="city"
                            label="Город"
                            rules={[{ required: true, message: "Выберите город проведения события" }]}
                            initialValue={npoData?.city}
                        >
                            <Select
                                placeholder="Выберите город"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                options={availableCities.map((city) => ({
                                    label: city,
                                    value: city,
                                }))}
                            />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Адрес"
                            help="Введите адрес места проведения события"
                        >
                            <Input placeholder="Например: г. Москва, ул. Ленина, д. 10" />
                        </Form.Item>

                        <Form.Item 
                            name="quantity" 
                            label="Количество участников"
                            rules={[{ required: true, message: "Укажите количество участников" }]}
                        >
                            <InputNumber min={1} style={{ width: "100%" }} placeholder="Количество" />
                        </Form.Item>

                        <Form.Item
                            name="tags"
                            label="Теги"
                            help="Разделяйте теги запятыми"
                        >
                            <Input placeholder="тег1, тег2, тег3" />
                        </Form.Item>

                        {editingEvent && (
                            <Form.Item
                                name="status"
                                label="Статус"
                                rules={[{ required: true, message: "Выберите статус" }]}
                            >
                                <Select options={statusOptions} />
                            </Form.Item>
                        )}

                        <Form.Item label="Изображения события">
                            <Upload
                                beforeUpload={async (file) => {
                                    try {
                                        setUploading(true);
                                        const result = await uploadFile(file).unwrap();
                                        setAttachedIds((prev) => [...prev, result.id]);
                                        message.success("Изображение успешно загружено");
                                        return false;
                                    } catch (error) {
                                        message.error("Ошибка при загрузке изображения");
                                        return false;
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                                showUploadList={false}
                                accept="image/*"
                                multiple
                            >
                                <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
                                    Загрузить изображения
                                </Button>
                            </Upload>
                            {attachedIds.length > 0 && (
                                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                                    {attachedIds.map((fileId) => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                            <div style={{ position: "relative" }}>
                                                <FilePreview fileId={fileId} />
                                                <Button
                                                    type="primary"
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                    style={{
                                                        position: "absolute",
                                                        top: 8,
                                                        right: 8,
                                                    }}
                                                    onClick={() => setAttachedIds((prev) => prev.filter((id) => id !== fileId))}
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default ManageEventsPage;

