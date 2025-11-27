import { useState, useEffect } from "react";
import { Tabs, Flex, Typography, Divider, Button, message } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import VolunteerRegistration from "./VolunteerRegistration/VolunteerRegistration";
import NPORegistration from "./NPORegistration/NPORegistration";
import VKIDButton from "@components/VKIDButton/VKIDButton";

import "./styles.scss";
import AuthLayout from "../AuthLayout/AuthLayout";
import { NavLink, useNavigate } from "react-router-dom";

const { Title } = Typography;

const RegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>("volunteer");
    
    // Если есть vk_id в параметрах, автоматически переключаемся на соответствующую вкладку
    useEffect(() => {
        const vkId = searchParams.get("vk_id");
        if (vkId) {
            // Если есть vk_id, но нет явного указания типа, оставляем текущую вкладку
            // (пользователь мог выбрать вкладку НКО или Волонтёр)
        }
    }, [searchParams]);
    
    const handleVKError = (error: any) => {
        console.error("VK ID Error:", error);
        message.error("Ошибка авторизации через VK. Попробуйте позже.");
    };

    const tabItems = [
        {
            key: "volunteer",
            label: (
                <Flex align="center" gap={8}>
                    <UserOutlined />
                    Волонтёр
                </Flex>
            ),
            children: <VolunteerRegistration />,
        },
        {
            key: "npo",
            label: (
                <Flex align="center" gap={8}>
                    <TeamOutlined />
                    НКО
                </Flex>
            ),
            children: <NPORegistration />,
        },
    ];

    return (
        <AuthLayout>
            <Title level={3} className="registration-page__form-title">
                Регистрация
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="registration-page__tabs"
            />

            <Divider plain>или</Divider>
            
            <Flex justify="center" style={{ marginTop: 16, marginBottom: 16 }}>
                <VKIDButton
                    appId={Number(import.meta.env.VITE_VK_APP_ID || "54342802")}
                    redirectUrl={`${window.location.origin}/auth/vk/callback`}
                    onError={handleVKError}
                />
            </Flex>

            <Flex justify="center" align="center" style={{ marginTop: 16 }}>
                <span style={{ marginRight: 8 }}>Уже есть аккаунт?</span>
                <NavLink to="/login">
                    <Button type="link" style={{ padding: 0 }}>
                        Войти
                    </Button>
                </NavLink>
            </Flex>
        </AuthLayout>
    );
};

export default RegistrationPage;
