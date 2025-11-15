import { Form, Input, Button, Flex, Typography, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";

import "./styles.scss";

import AuthLayout from "../AuthLayout/AuthLayout";

import { useLoginMutation } from "@services/api/auth.api";
import useAppDispatch from "@hooks/useAppDispatch";
import { setToken } from "@services/slices/auth.slice";

const { Title } = Typography;

type FormValues = {
    login: string;
    password: string;
};

const LoginPage = () => {
    const [login] = useLoginMutation();
    const dispatch = useAppDispatch();

    const onFinish = async (values: FormValues) => {
        try {
            const response = await login(values).unwrap();
            dispatch(setToken(response.access_token));
        } catch (error) {}
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
