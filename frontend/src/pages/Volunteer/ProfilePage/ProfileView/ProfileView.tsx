import React from "react";
import { Descriptions, Avatar, Typography, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import type { IVolunteer } from "@app-types/volunteer.types";

const { Title, Paragraph } = Typography;

interface ProfileViewProps {
    profileData: IVolunteer;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profileData }) => {
    const getSexText = (sex?: string) => {
        return sex === "male" ? "Мужской" : sex === "female" ? "Женский" : "Не указано";
    };

    return (
        <Flex gap={24}>
            <Avatar size={100} icon={<UserOutlined />} />
            <div style={{ flex: 1 }}>
                <Title level={3}>
                    {profileData.secondName} {profileData.firstName} {profileData.middleName || ""}
                </Title>

                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Город">{profileData.city}</Descriptions.Item>
                    <Descriptions.Item label="Email">{profileData.email}</Descriptions.Item>
                    <Descriptions.Item label="Телефон">
                        {profileData.phone || "Не указан"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Дата рождения">
                        {profileData.birthday
                            ? dayjs(profileData.birthday).format("DD.MM.YYYY")
                            : "Не указана"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Пол">{getSexText(profileData.sex)}</Descriptions.Item>
                </Descriptions>

                {profileData.about && (
                    <div style={{ marginTop: 16 }}>
                        <Title level={5}>О себе</Title>
                        <Paragraph>{profileData.about}</Paragraph>
                    </div>
                )}
            </div>
        </Flex>
    );
};

export default ProfileView;
