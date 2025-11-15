import { Form, Input, Button, Select, Flex } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import type { IRegNPORequest } from "@app-types/auth.types";
import { useLazyGeodecodeQuery } from "@services/api/geodecode.api";
import { useRegisterNPOMutation } from "@services/api/auth.api";
import { login } from "@services/slices/auth.slice";
import useAppDispatch from "@hooks/useAppDispatch";

const { Option } = Select;
const { TextArea } = Input;

interface NPORCreate {
    login: string;
    password: string;
    name: string;
    description: string;
    coordinates: undefined;
    address: string;
    tags: string[];
    links: { type: string; url: string }[];
    timetable: string;
}

const NPORegistration = () => {
    const [geodecode] = useLazyGeodecodeQuery();
    const [register] = useRegisterNPOMutation();
    const dispatch = useAppDispatch();

    const onFinish = async (values: NPORCreate) => {
        const geoResponse = await geodecode(values.address).unwrap();
        const registerValues: IRegNPORequest = {
            ...values,
            coordinates: [Number(geoResponse[0].lat), Number(geoResponse[0].lon)],
            links: values.links.reduce<Record<string, string>>((acc, current, index) => {
                acc[`${current.type}-${index}`] = current.url;
                return acc;
            }, {}),
        };

        const response = await register(registerValues).unwrap();
        dispatch(login({ token: response.access_token, type: response.user_type }));
    };

    return (
        <Form
            name="npo-registration"
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

            <Form.Item
                label="Название организации"
                name="name"
                rules={[{ required: true, message: "Введите название организации" }]}
            >
                <Input placeholder="Благотворительный фонд 'Помощь'" size="large" />
            </Form.Item>

            <Form.Item
                label="Описание деятельности"
                name="description"
                rules={[{ required: true, message: "Введите описание деятельности" }]}
            >
                <TextArea
                    placeholder="Опишите основную деятельность вашей организации..."
                    rows={4}
                />
            </Form.Item>

            <Form.Item
                label="Адрес"
                name="address"
                rules={[{ required: true, message: "Введите адрес организации" }]}
            >
                <Input placeholder="г. Москва" size="large" />
            </Form.Item>

            <Form.Item name="coordinates" hidden>
                <Input />
            </Form.Item>

            <Form.Item
                label="Теги"
                name="tags"
                rules={[{ required: true, message: "Добавьте хотя бы один тег" }]}
            >
                <Select
                    mode="tags"
                    placeholder="Добавьте теги (экология, животные, дети...)"
                    size="large"
                >
                    <Option value="ecology">Экология</Option>
                    <Option value="animals">Животные</Option>
                    <Option value="children">Дети</Option>
                    <Option value="elderly">Пожилые люди</Option>
                    <Option value="culture">Культура</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Ссылки">
                <Form.List name="links">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Flex gap={8} key={field.key}>
                                    <Form.Item {...field} name={[field.name, "type"]}>
                                        <Select style={{ width: 120 }}>
                                            <Option value="website">Сайт</Option>
                                            <Option value="vk">VK</Option>
                                            <Option value="tg">Telegram</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item {...field} name={[field.name, "url"]}>
                                        <Input placeholder="Ссылка" />
                                    </Form.Item>
                                    <Button onClick={() => remove(field.name)}>×</Button>
                                </Flex>
                            ))}
                            <Button onClick={() => add()}>+ Добавить ссылку</Button>
                        </>
                    )}
                </Form.List>
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="registration-form__submit-btn"
                >
                    Зарегистрировать организацию
                </Button>
            </Form.Item>
        </Form>
    );
};

export default NPORegistration;
