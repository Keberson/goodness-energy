import React from "react";
import { DatePicker, Flex, Form, Input, Select } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import PhoneInput from "@components/controls/PhoneInput/PhoneInput";
import useAppSelector from "@hooks/useAppSelector";

const { Option } = Select;
const { TextArea } = Input;

interface VolunteerFormProps {
    hideAuthFields?: boolean; // Если true - скрыть поля полностью
    optionalAuthFields?: boolean; // Если true - показать поля, но сделать их необязательными
}

const VolunteerForm: React.FC<VolunteerFormProps> = ({ hideAuthFields = false, optionalAuthFields = false }) => {
    const availableCities = useAppSelector((state) => state.city.availableCities);
    
    return (
        <>
            {!hideAuthFields && (
                <>
                    <Form.Item
                        label="Логин"
                        name="login"
                        rules={optionalAuthFields ? [] : [{ required: true, message: "Введите логин" }]}
                        tooltip={optionalAuthFields ? "Необязательно. Если не укажете, логин будет сгенерирован автоматически" : undefined}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={optionalAuthFields ? [] : [{ required: true, message: "Введите пароль" }]}
                        tooltip={optionalAuthFields ? "Необязательно. Если не укажете, пароль будет сгенерирован автоматически. Укажите пароль, если хотите входить не только через VK" : undefined}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Придумайте пароль"
                            size="large"
                        />
                    </Form.Item>
                </>
            )}
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
                    <Select placeholder="Выберите город" size="large">
                        {availableCities.map((city) => (
                            <Option key={city} value={city}>
                                {city}
                            </Option>
                        ))}
                    </Select>
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
