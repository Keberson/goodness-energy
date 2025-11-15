import { Form, Input, Button, Select, Flex } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const NPORegistration = () => {
    const onFinish = (values: any) => {
        console.log("NPO registration:", values);
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
