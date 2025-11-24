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

const LoginPage = () => {
    const [loginAPI] = useLoginMutation();
    const [vkidLogin] = useVkidLoginMutation();
    const dispatch = useAppDispatch();
    const [vkidUserType, setVkidUserType] = useState<"volunteer" | "npo">("volunteer");
    const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || "";
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

    const handleVKIDCallback = async (code: string, userType: "volunteer" | "npo") => {
        try {
            // Формируем redirect_uri (должен совпадать с тем, что был использован при авторизации)
            const redirectUri = `${window.location.origin}${window.location.pathname}`;

            // Отправляем code на backend для обмена на access_token
            const response = await fetch(`${API_BASE_URL}/auth/vkid/callback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code, user_type: userType, redirect_uri: redirectUri }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Ошибка при обмене кода на токен");
            }

            const data = await response.json();

            // Теперь используем полученный токен для авторизации
            const result = await vkidLogin({
                token: data.access_token,
                user_type: userType,
            }).unwrap();

            dispatch(
                login({
                    token: result.access_token,
                    type: result.user_type,
                    id: result.id,
                })
            );
            message.success("Успешный вход через VK ID");

            // Очищаем URL от параметров
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error: any) {
            message.error(error?.message || error?.data?.detail || "Ошибка при входе через VK ID");
            // Очищаем URL от параметров
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    // Обработка callback от VK ID после редиректа
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
            message.error(errorDescription || "Ошибка авторизации через VK ID");
            // Очищаем URL от параметров
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (code && state) {
            // Проверяем, что state соответствует ожидаемому формату: "vkid_{user_type}"
            const stateParts = state.split("_");
            if (stateParts.length === 2 && stateParts[0] === "vkid") {
                const userType = stateParts[1] as "volunteer" | "npo";

                // Обмениваем code на access_token через backend
                handleVKIDCallback(code, userType);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFinish = async (values: FormValues) => {
        try {
            const response = await loginAPI(values).unwrap();
            dispatch(
                login({ token: response.access_token, type: response.user_type, id: response.id })
            );
        } catch (error) {}
    };

    const handleVKIDLogin = () => {
        if (!VK_APP_ID) {
            message.error("VK ID не настроен");
            return;
        }

        // Формируем redirect_uri (должен совпадать с настройками в VK приложении)
        const redirectUri = encodeURIComponent(
            `${window.location.origin}${window.location.pathname}`
        );

        // Формируем state для передачи типа пользователя
        const state = `vkid_${vkidUserType}`;

        // Формируем URL для авторизации через VK ID
        // Используем правильный endpoint для VK ID
        const vkAuthUrl =
            `https://id.vk.com/oauth/authorize?` +
            `client_id=${VK_APP_ID}&` +
            `redirect_uri=${redirectUri}&` +
            `response_type=code&` +
            `scope=email&` +
            `state=${state}`;

        // Перенаправляем пользователя на страницу авторизации VK
        window.location.href = vkAuthUrl;
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
