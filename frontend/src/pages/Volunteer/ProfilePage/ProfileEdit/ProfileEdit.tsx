import React from "react";
import { Form, Button, Flex } from "antd";

import VolunteerForm from "@components/VolunteerForm/VolunteerForm";

import type { IVolunteer } from "@app-types/volunteer.types";

import { useEditVolunteerMutation } from "@services/api/volunteer.api";

interface ProfileEditProps {
    profileData: IVolunteer;
    onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ profileData, onCancel }) => {
    const [editVolunteer] = useEditVolunteerMutation();

    const handleSubmit = async (values: IVolunteer) => {
        await editVolunteer({ id: profileData.id, body: values });
        onCancel();
    };

    return (
        <Form layout="vertical" initialValues={profileData} onFinish={handleSubmit}>
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
