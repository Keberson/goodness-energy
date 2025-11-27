import { Form, Button, Alert } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

    // Получаем данные VK из URL параметров
    const vkId = searchParams.get("vk_id");
    const vkFirstName = searchParams.get("first_name");
    const vkLastName = searchParams.get("last_name");
    const vkEmail = searchParams.get("email");
    const vkBdate = searchParams.get("bdate");
    const vkSex = searchParams.get("sex");
    const vkCity = searchParams.get("city");
    const vkPhone = searchParams.get("phone");

    // Предзаполняем форму данными из VK
    useEffect(() => {
        if (vkId) {
            // Преобразуем пол из VK формата (1 - женский, 2 - мужской) в формат приложения
            let sex = undefined;
            if (vkSex === "1") sex = "female";
            else if (vkSex === "2") sex = "male";
            
            // Преобразуем дату рождения из формата "DD.MM.YYYY" или "DD.MM"
            let birthday = undefined;
            if (vkBdate) {
                // Если формат "DD.MM.YYYY", преобразуем в "YYYY-MM-DD"
                const parts = vkBdate.split(".");
                if (parts.length === 3) {
                    birthday = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else if (parts.length === 2) {
                    // Если только "DD.MM", используем текущий год
                    const year = new Date().getFullYear();
                    birthday = `${year}-${parts[1]}-${parts[0]}`;
                }
            }
            
            form.setFieldsValue({
                firstName: vkFirstName || "",
                secondName: vkLastName || "",
                email: vkEmail || "",
                birthday: birthday,
                sex: sex,
                city: vkCity || "",
                phone: vkPhone || "",
            });
        }
    }, [vkId, vkFirstName, vkLastName, vkEmail, vkBdate, vkSex, vkCity, vkPhone, form]);

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
