import { Form, Input, Button, Flex, Typography, Divider, message, Select } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import "./styles.scss";

import AuthLayout from "../AuthLayout/AuthLayout";

import { useLoginMutation, useVkidLoginMutation } from "@services/api/auth.api";
import { login } from "@services/slices/auth.slice";
import useAppDispatch from "@hooks/useAppDispatch";

const { Title } = Typography;

type FormValues = {
    login: string;
    password: string;
};

// Объявляем тип для VK ID SDK
declare global {
    interface Window {
        VK?: {
            init: (config: { apiId: number }) => void;
            Auth: {
                login: (callback: (response: { session: { access_token: string; user: { id: number } } }) => void, settings: number) => void;
            };
        };
    }
}

const LoginPage = () => {
    const [loginAPI] = useLoginMutation();
    const [vkidLogin] = useVkidLoginMutation();
    const dispatch = useAppDispatch();
    const [vkidUserType, setVkidUserType] = useState<"volunteer" | "npo">("volunteer");
    const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || "";

    // Загружаем VK ID SDK
    useEffect(() => {
        if (!VK_APP_ID) {
            console.warn("VK_APP_ID не настроен");
            return;
        }

        // Проверяем, не загружен ли уже скрипт
        if (window.VK) {
            window.VK.init({ apiId: Number(VK_APP_ID) });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://vk.com/js/api/openapi.js?169";
        script.async = true;
        script.onload = () => {
            if (window.VK) {
                window.VK.init({ apiId: Number(VK_APP_ID) });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Очистка при размонтировании не требуется, скрипт может остаться
        };
    }, [VK_APP_ID]);

    const onFinish = async (values: FormValues) => {
        try {
            const response = await loginAPI(values).unwrap();
            dispatch(login({ token: response.access_token, type: response.user_type, id: response.id }));
        } catch (error) {}
    };

    const handleVKIDLogin = () => {
        if (!window.VK) {
            message.error("VK ID SDK не загружен. Проверьте настройки VK_APP_ID.");
            return;
        }

        if (!VK_APP_ID) {
            message.error("VK ID не настроен");
            return;
        }

        window.VK.Auth.login(
            async (response) => {
                if (response.session) {
                    try {
                        const result = await vkidLogin({
                            token: response.session.access_token,
                            user_type: vkidUserType,
                        }).unwrap();
                        dispatch(login({ token: result.access_token, type: result.user_type, id: result.id }));
                        message.success("Успешный вход через VK ID");
                    } catch (error: any) {
                        message.error(error?.data?.detail || "Ошибка при входе через VK ID");
                    }
                }
            },
            4194304 // Права доступа: email, friends, offline
        );
    };

    return (
        <AuthLayout>
            <Title level={3} className="login-page__form-title">
                Вход в аккаунт
            </Title>

            <Form<FormValues>
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="login-page__form"
            >
                <Form.Item
                    label="Логин"
                    name="login"
                    rules={[
                        {
                            required: true,
                            message: "Пожалуйста, введите ваш логин",
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Введите логин" size="large" />
                </Form.Item>

                <Form.Item
                    label="Пароль"
                    name="password"
                    rules={[{ required: true, message: "Пожалуйста, введите ваш пароль" }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Введите пароль"
                        size="large"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        className="login-page__submit-btn"
                    >
                        Войти
                    </Button>
                </Form.Item>
            </Form>

            <Divider plain>или</Divider>

            {VK_APP_ID && (
                <Flex gap="small" vertical style={{ marginBottom: 16 }}>
                    <Select
                        value={vkidUserType}
                        onChange={(value) => setVkidUserType(value)}
                        options={[
                            { label: "Волонтер", value: "volunteer" },
                            { label: "НКО", value: "npo" },
                        ]}
                        style={{ width: "100%" }}
                    />
                    <Button
                        type="default"
                        size="large"
                        block
                        onClick={handleVKIDLogin}
                        style={{
                            backgroundColor: "#0077FF",
                            borderColor: "#0077FF",
                            color: "white",
                        }}
                    >
                        Войти через VK ID
                    </Button>
                </Flex>
            )}

            <Flex gap="small" vertical>
                <NavLink to="/reg">
                    <Button type="default" size="large" block className="login-page__register-btn">
                        Создать аккаунт
                    </Button>
                </NavLink>
                <Button type="link" block className="login-page__forgot-btn">
                    Забыли пароль?
                </Button>
            </Flex>
        </AuthLayout>
    );
};

export default LoginPage;
