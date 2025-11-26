import React, { useState, useEffect } from "react";
import { Card, Checkbox, Space, Typography, App, Button } from "antd";
import { MailOutlined, SaveOutlined } from "@ant-design/icons";

import {
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
} from "@services/api/auth.api";
import type { INotificationSettingsUpdate } from "@app-types/auth.types";

const { Text } = Typography;

const NotificationSettings: React.FC = () => {
    const { data: settings } = useGetNotificationSettingsQuery();
    const [updateSettings, { isLoading }] = useUpdateNotificationSettingsMutation();
    const { message } = App.useApp();

    // Локальное состояние для хранения изменений
    const [localSettings, setLocalSettings] = useState({
        notify_city_news: false,
        notify_events: false,
    });

    // Синхронизируем локальное состояние с данными из сервера
    useEffect(() => {
        if (settings) {
            setLocalSettings({
                notify_city_news: settings.notify_city_news,
                notify_events: settings.notify_events,
            });
        }
    }, [settings]);

    // Проверяем, есть ли несохранённые изменения
    const hasChanges =
        settings &&
        (localSettings.notify_city_news !== settings.notify_city_news ||
            localSettings.notify_events !== settings.notify_events);

    const handleChange = (field: "notify_city_news" | "notify_events", checked: boolean) => {
        setLocalSettings((prev) => ({
            ...prev,
            [field]: checked,
        }));
    };

    const handleSave = async () => {
        if (!settings) return;

        try {
            const update: INotificationSettingsUpdate = {
                notify_city_news: localSettings.notify_city_news,
                notify_events: localSettings.notify_events,
            };
            await updateSettings(update).unwrap();
            message.success("Настройки уведомлений успешно сохранены");
        } catch (error) {
            message.error("Ошибка при сохранении настроек уведомлений");
        }
    };

    if (!settings) {
        return null;
    }

    return (
        <Card
            title={
                <Space>
                    <MailOutlined />
                    <span>Настройки email уведомлений</span>
                </Space>
            }
            style={{ marginTop: 24 }}
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Checkbox
                        checked={localSettings.notify_city_news}
                        onChange={(e) => handleChange("notify_city_news", e.target.checked)}
                    >
                        <Text strong>Уведомления о новостях из вашего города</Text>
                    </Checkbox>
                    <div style={{ marginLeft: 24, marginTop: 4, color: "#8c8c8c" }}>
                        Получать уведомления о новых новостях, опубликованных в вашем городе
                    </div>
                </div>

                <div>
                    <Checkbox
                        checked={localSettings.notify_events}
                        onChange={(e) => handleChange("notify_events", e.target.checked)}
                    >
                        <Text strong>Уведомления о событиях</Text>
                    </Checkbox>
                    <div style={{ marginLeft: 24, marginTop: 4, color: "#8c8c8c" }}>
                        Получать уведомления о новых событиях и мероприятиях
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={isLoading}
                        disabled={!hasChanges}
                    >
                        Сохранить
                    </Button>
                </div>
            </Space>
        </Card>
    );
};

export default NotificationSettings;
