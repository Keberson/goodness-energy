import { Form, Input, Button, Select, Flex } from "antd";

import useAppSelector from "@hooks/useAppSelector";

const { Option } = Select;
const { TextArea } = Input;

const NPOForm = () => {
    const availableCities = useAppSelector((state) => state.city.availableCities);

    return (
        <>
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
                label="Город"
                name="city"
                rules={[{ required: true, message: "Введите город организации" }]}
            >
                <Select placeholder="Выберете город" size="large">
                    {availableCities.map((value) => (
                        <Option value={value}>{value}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Адрес"
                name="address"
                rules={[{ required: true, message: "Введите адрес организации" }]}
            >
                <Input placeholder="г. Москва, ул. Пушкина, д. 1" size="large" />
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
                    <Option value="Экология и устойчивое развитие">
                        Экология и устойчивое развитие
                    </Option>
                    <Option value="Защита животных">Защита животных</Option>
                    <Option value="Культура и образование">Культура и образование</Option>
                    <Option value="Местное сообщество и развитие территорий">
                        Местное сообщество и развитие территорий
                    </Option>
                    <Option value="Социальная защита (помощь людям в трудной ситуации)">
                        Социальная защита (помощь людям в трудной ситуации)
                    </Option>
                    <Option value="Здоровье и спорт">Здоровье и спорт</Option>
                    <Option value="Другое">Другое</Option>
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
        </>
    );
};

export default NPOForm;
