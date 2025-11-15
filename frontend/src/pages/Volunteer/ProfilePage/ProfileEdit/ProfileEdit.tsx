import React from "react";
import { Form, Button, Flex } from "antd";

import VolunteerForm from "@components/VolunteerForm/VolunteerForm";

interface ProfileData {
    firstName: string;
    secondName: string;
    middleName?: string;
    about?: string;
    birthday?: string;
    city: string;
    sex?: string;
    email: string;
    phone?: string;
}

interface ProfileEditProps {
    profileData: ProfileData;
    onSave: (values: any) => void;
    onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profileData, onSave, onCancel }) => {
    const [form] = Form.useForm<ProfileData>();
    console.log(profileData);

    const handleSubmit = (values: any) => {
        onSave(values);
    };

    return (
        <Form form={form} layout="vertical" initialValues={profileData} onFinish={handleSubmit}>
            <VolunteerForm />

            <Flex gap={8} justify="flex-end">
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" htmlType="submit">
                    Сохранить
                </Button>
            </Flex>
        </Form>
    );
};

export default ProfileEdit;
