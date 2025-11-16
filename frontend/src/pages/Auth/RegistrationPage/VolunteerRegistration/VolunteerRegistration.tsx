import { Form, Button } from "antd";

import type { IRegVolunteerRequest } from "@app-types/auth.types";
import { useRegisterVolunteerMutation } from "@services/api/auth.api";
import useAppDispatch from "@hooks/useAppDispatch";
import { login } from "@services/slices/auth.slice";
import VolunteerForm from "@components/VolunteerForm/VolunteerForm";

const VolunteerRegistration = () => {
    const [register] = useRegisterVolunteerMutation();
    const dispatch = useAppDispatch();

    const onFinish = async (values: IRegVolunteerRequest) => {
        try {
            const response = await register(values).unwrap();
            dispatch(
                login({ token: response.access_token, type: response.user_type, id: response.id })
            );
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
            <VolunteerForm />

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
