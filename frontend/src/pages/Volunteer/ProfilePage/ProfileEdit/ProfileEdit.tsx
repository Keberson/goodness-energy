import React from "react";
import { Form, Button, Flex } from "antd";

import VolunteerForm from "@components/VolunteerForm/VolunteerForm";

import type { IVolunteer, IVolunteerEdit } from "@app-types/volunteer.types";

import { useEditVolunteerMutation } from "@services/api/volunteer.api";

interface ProfileEditProps {
    profileData: IVolunteer;
    onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profileData, onCancel }) => {
    const [editVolunteer] = useEditVolunteerMutation();

    const handleSubmit = async (values: IVolunteerEdit) => {
        await editVolunteer({ id: profileData.id, body: values });
        onCancel();
    };

    // Исключаем поля, которые не должны редактироваться
    const { id, created_at, ...editFormData } = profileData;

    return (
        <Form layout="vertical" initialValues={editFormData} onFinish={handleSubmit}>
            <VolunteerForm hideAuthFields={true} />

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
