import { Form, Button, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import type { IRegNPORequest } from "@app-types/auth.types";
import type { INPOCreate } from "@app-types/npo.types";

import { useLazyGeodecodeQuery } from "@services/api/geodecode.api";
import { useRegisterNPOMutation } from "@services/api/auth.api";
import { login } from "@services/slices/auth.slice";

import useAppDispatch from "@hooks/useAppDispatch";

import NPOForm from "@components/NPOForm/NPOForm";

const NPORegistration = () => {
    const [geodecode] = useLazyGeodecodeQuery();
    const [register] = useRegisterNPOMutation();
    const dispatch = useAppDispatch();

    const onFinish = async (values: INPOCreate) => {
        const geoResponse = await geodecode(values.address).unwrap();
        const geo = geoResponse.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
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
        };

        const response = await register(registerValues).unwrap();
        dispatch(
            login({ token: response.access_token, type: response.user_type, id: response.id })
        );
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
