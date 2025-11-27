import { Form, Button, Input, Alert } from "antd";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

import type { IRegNPORequest } from "@app-types/auth.types";
import type { INPOCreate } from "@app-types/npo.types";

import { useLazyGeodecodeQuery } from "@services/api/geodecode.api";
import { useRegisterNPOMutation } from "@services/api/auth.api";
import { login } from "@services/slices/auth.slice";

import useAppDispatch from "@hooks/useAppDispatch";
import { useCity } from "@hooks/useCity";

import NPOForm from "@components/NPOForm/NPOForm";

const NPORegistration = () => {
    const [geodecode] = useLazyGeodecodeQuery();
    const [register] = useRegisterNPOMutation();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const [form] = Form.useForm();
    
    // Загружаем города для выпадающего списка
    useCity();
    
    // Получаем данные VK из URL параметров
    const vkId = searchParams.get("vk_id");
    const vkEmail = searchParams.get("email");
    
    // Автозаполнение формы данными из VK
    useEffect(() => {
        if (vkId && vkEmail) {
            form.setFieldsValue({
                email: vkEmail,
            });
        }
    }, [vkId, vkEmail, form]);

    const onFinish = async (values: INPOCreate) => {
        const geoResponse = await geodecode(values.address).unwrap();
        const geoObject = geoResponse.response.GeoObjectCollection.featureMember?.[0]?.GeoObject;
        
        if (!geoObject?.Point?.pos) {
            throw new Error("Не удалось получить координаты для указанного адреса");
        }
        
        const geo = geoObject.Point.pos
            .split(" ")
            .map((item) => Number(item))
            .reverse();
        const registerValues: IRegNPORequest = {
            ...values,
            coordinates: geo as [number, number],
            links: (values.links ?? []).reduce<Record<string, string>>((acc, current, index) => {
                acc[`${current.type}-${index}`] = current.url;
                return acc;
            }, {}),
            // Добавляем VK данные, если есть
            ...(vkId ? { vk_id: Number(vkId) } : {}),
            ...(vkEmail ? { email: vkEmail } : {}),
        };

        const response = await register(registerValues).unwrap();
        dispatch(
            login({ token: response.access_token, type: response.user_type, id: response.id })
        );
    };

    return (
        <Form
            form={form}
            name="npo-registration"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="registration-form"
        >
            {vkId && (
                <Alert
                    message="Регистрация через VK"
                    description="Вы регистрируетесь через VK. Поля логин и пароль необязательны, но вы можете их указать, если хотите входить не только через VK."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}
            
            {vkId && (
                <Form.Item name="vk_id" hidden>
                    <Input />
                </Form.Item>
            )}
            
            <Form.Item
                label="Логин"
                name="login"
                rules={vkId ? [] : [{ required: true, message: "Введите логин" }]}
                tooltip={vkId ? "Необязательно. Если не укажете, логин будет сгенерирован автоматически" : undefined}
            >
                <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
            </Form.Item>

            <Form.Item
                label="Пароль"
                name="password"
                rules={vkId ? [] : [{ required: true, message: "Введите пароль" }]}
                tooltip={vkId ? "Необязательно. Если не укажете, пароль будет сгенерирован автоматически. Укажите пароль, если хотите входить не только через VK" : undefined}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Придумайте пароль"
                    size="large"
                />
            </Form.Item>
            
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { type: "email", message: "Введите корректный email" },
                    { required: true, message: "Введите email" },
                ]}
            >
                <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Email" 
                    size="large"
                    disabled={!!vkEmail}  // Блокируем, если пришло из VK
                />
            </Form.Item>

            <NPOForm />

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
