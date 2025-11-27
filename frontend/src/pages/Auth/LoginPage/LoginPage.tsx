import { Form, Input, Button, Flex, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";

import "./styles.scss";

import AuthLayout from "../AuthLayout/AuthLayout";

import { useLoginMutation } from "@services/api/auth.api";
import { login } from "@services/slices/auth.slice";
import useAppDispatch from "@hooks/useAppDispatch";
import { getApiBaseUrl } from "@utils/apiUrl";

const { Title } = Typography;

type FormValues = {
    login: string;
    password: string;
};

const LoginPage = () => {
    const [loginAPI] = useLoginMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onFinish = async (values: FormValues) => {
        try {
            const response = await loginAPI(values).unwrap();
            dispatch(
                login({ token: response.access_token, type: response.user_type, id: response.id })
            );
            navigate("/");
        } catch (error) {}
    };

    const handleVKLogin = () => {
        // Получаем текущий URL для redirect
        const redirectUri = `${window.location.origin}/auth/vk/callback`;
        const apiBaseUrl = getApiBaseUrl();
        const vkLoginUrl = `${apiBaseUrl}/auth/vk/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = vkLoginUrl;
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

            <Divider>или</Divider>

            <Button
                type="default"
                size="large"
                block
                className="login-page__vk-btn"
                onClick={handleVKLogin}
            >
                Войти через VK
            </Button>

            <Flex gap="small" vertical style={{ marginTop: 16 }}>
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
