import { useState, useEffect } from "react";
import { Tabs, Flex, Typography, Divider, Button } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";

import VolunteerRegistration from "./VolunteerRegistration/VolunteerRegistration";
import NPORegistration from "./NPORegistration/NPORegistration";

import "./styles.scss";
import AuthLayout from "../AuthLayout/AuthLayout";
import { NavLink } from "react-router-dom";

const { Title } = Typography;

const RegistrationPage = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>("volunteer");
    
    // Если есть vk_id в параметрах, автоматически переключаемся на вкладку волонтера
    useEffect(() => {
        if (searchParams.get("vk_id")) {
            setActiveTab("volunteer");
        }
    }, [searchParams]);

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
