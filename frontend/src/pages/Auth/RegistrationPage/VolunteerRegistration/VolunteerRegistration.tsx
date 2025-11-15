import { Form, Input, Button, DatePicker, Select, Flex } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";

import type { IRegVolunteerRequest } from "@app-types/auth.types";
import { useRegisterVolunteerMutation } from "@services/api/auth.api";
import PhoneInput from "@components/PhoneInput/PhoneInput";
import useAppDispatch from "@hooks/useAppDispatch";
import { setToken } from "@services/slices/auth.slice";

const { Option } = Select;
const { TextArea } = Input;

const VolunteerRegistration = () => {
    const [register] = useRegisterVolunteerMutation();
    const dispatch = useAppDispatch();

    const onFinish = async (values: IRegVolunteerRequest) => {
        try {
            const response = await register(values).unwrap();
            dispatch(setToken(response.access_token));
        } catch (error) {}
    };

    return (
        <Form
            name="volunteer-registration"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="registration-form"
        >
            <Form.Item
                label="Логин"
                name="login"
                rules={[{ required: true, message: "Введите логин" }]}
            >
                <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={[{ required: true, message: "Введите пароль" }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Придумайте пароль"
                    size="large"
                />
            </Form.Item>

            <Flex gap="middle">
                <Form.Item
                    label="Фамилия"
                    name="secondName"
                    rules={[{ required: true, message: "Введите фамилию" }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Иванов" size="large" />
                </Form.Item>

                <Form.Item
                    label="Имя"
                    name="firstName"
                    rules={[{ required: true, message: "Введите имя" }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Иван" size="large" />
                </Form.Item>
            </Flex>

            <Form.Item label="Отчество" name="middleName">
                <Input placeholder="Иванович" size="large" />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Введите email" },
                    { type: "email", message: "Некорректный email" },
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="ivanov@example.com" size="large" />
            </Form.Item>

            <Form.Item label="Телефон" name="phone">
                <PhoneInput />
            </Form.Item>

            <Flex gap="middle">
                <Form.Item
                    label="Город"
                    name="city"
                    rules={[{ required: true, message: "Выберите город" }]}
                    style={{ flex: 1 }}
                >
                    <Input placeholder="Введите город" size="large" />
                </Form.Item>

                <Form.Item label="Пол" name="sex" style={{ flex: 1 }}>
                    <Select placeholder="Выберите пол" size="large">
                        <Option value="male">Мужской</Option>
                        <Option value="female">Женский</Option>
                    </Select>
                </Form.Item>
            </Flex>

            <Form.Item
                label="Дата рождения"
                name="birthday"
                rules={[{ required: true, message: "Выберите дату" }]}
            >
                <DatePicker style={{ width: "100%" }} size="large" placeholder="Выберите дату" />
            </Form.Item>

            <Form.Item label="О себе" name="about">
                <TextArea placeholder="Расскажите о себе и своих интересах..." rows={3} />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="registration-form__submit-btn"
                >
                    Зарегистрироваться как волонтёр
                </Button>
            </Form.Item>
        </Form>
    );
};

export default VolunteerRegistration;
