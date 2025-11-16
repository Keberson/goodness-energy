import { useState } from "react";
import { Card, Button, Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import ProfileView from "./ProfileView/ProfileView";
import ProfileEdit from "./ProfileEdit/ProfileEdit";

import { useGetVolunteerByIdQuery } from "@services/api/volunteer.api";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";

const { Title } = Typography;

const ProfilePage = () => {
    const [editing, setEditing] = useState(false);
    const userId = useAppSelector((state) => state.auth.userId);
    const { data } = useGetVolunteerByIdQuery(userId ?? skipToken);

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={2}>Личный кабинет</Title>
                    {!editing && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditing(true)}
                        >
                            Редактировать
                        </Button>
                    )}
                </Flex>

                {data && editing && (
                    <ProfileEdit
                        profileData={data}
                        onCancel={() => setEditing(false)}
                    />
                )}
                {data && !editing && <ProfileView profileData={data} />}
            </Card>
        </div>
    );
};

export default ProfilePage;
