import { Form, Button, Alert } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";

import type { IRegVolunteerRequest } from "@app-types/auth.types";
import { useRegisterVolunteerMutation } from "@services/api/auth.api";
import useAppDispatch from "@hooks/useAppDispatch";
import { login } from "@services/slices/auth.slice";
import VolunteerForm from "@components/VolunteerForm/VolunteerForm";

const VolunteerRegistration = () => {
    const [register] = useRegisterVolunteerMutation();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Получаем vk_id из URL параметров
    const vkId = searchParams.get("vk_id");

    // При регистрации через VK просто сохраняем vk_id, пользователь заполнит данные сам

    const onFinish = async (values: IRegVolunteerRequest) => {
        try {
            // Добавляем vk_id если он есть в параметрах
            const registrationData: IRegVolunteerRequest = {
                ...values,
                vk_id: vkId ? Number(vkId) : undefined,
            };
            
            const response = await register(registrationData).unwrap();
            dispatch(
                login({ token: response.access_token, type: response.user_type, id: response.id })
            );
            navigate("/");
        } catch (error) {}
    };

    return (
        <Form
            form={form}
            name="volunteer-registration"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            className="registration-form"
        >
            {/* Скрытое поле для vk_id */}
            {vkId && <Form.Item name="vk_id" hidden initialValue={Number(vkId)} />}
            
            {/* Информационное сообщение при регистрации через VK */}
            {vkId && (
                <Alert
                    message="Регистрация через VK"
                    description="Вы регистрируетесь через VK. Заполните дополнительные данные для завершения регистрации."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}
            
            <VolunteerForm hideAuthFields={!!vkId} />

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
