import React from "react";
import { Card, Checkbox, Space, Typography, App } from "antd";
import { MailOutlined } from "@ant-design/icons";

import {
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
} from "@services/api/auth.api";
import type { INotificationSettingsUpdate } from "@app-types/auth.types";

const { Text } = Typography;

const NotificationSettings: React.FC = () => {
    const { data: settings } = useGetNotificationSettingsQuery();
    const [updateSettings] = useUpdateNotificationSettingsMutation();
    const { message } = App.useApp();

    const handleChange = async (
        field: "notify_city_news" | "notify_events",
        checked: boolean
    ) => {
        if (!settings) return;

        try {
            const update: INotificationSettingsUpdate = {
                [field]: checked,
            };
            await updateSettings(update).unwrap();
            // Сообщение не показываем, так как обновление происходит автоматически через invalidate
        } catch (error) {
            message.error("Ошибка при обновлении настроек уведомлений");
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
                        checked={settings.notify_city_news}
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
                        checked={settings.notify_events}
                        onChange={(e) => handleChange("notify_events", e.target.checked)}
                    >
                        <Text strong>Уведомления о событиях</Text>
                    </Checkbox>
                    <div style={{ marginLeft: 24, marginTop: 4, color: "#8c8c8c" }}>
                        Получать уведомления о новых событиях и мероприятиях
                    </div>
                </div>
            </Space>
        </Card>
    );
};

export default NotificationSettings;
