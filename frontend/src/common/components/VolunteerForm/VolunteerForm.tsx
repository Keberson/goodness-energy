import { DatePicker, Flex, Form, Input, Select } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import PhoneInput from "@components/controls/PhoneInput/PhoneInput";

const { Option } = Select;
const { TextArea } = Input;

const VolunteerForm = () => {
    return (
        <>
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
                getValueProps={(value) => ({
                    value: value ? dayjs(value) : null,
                })}
            >
                <DatePicker style={{ width: "100%" }} size="large" placeholder="Выберите дату" />
            </Form.Item>
            <Form.Item label="О себе" name="about">
                <TextArea placeholder="Расскажите о себе и своих интересах..." rows={3} />
            </Form.Item>
        </>
    );
};

export default VolunteerForm;
