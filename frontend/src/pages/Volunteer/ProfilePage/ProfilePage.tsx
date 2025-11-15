import { useState } from "react";
import { Card, Button, Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import ProfileView from "./ProfileView/ProfileView";
import ProfileEdit from "./ProfileEdit/ProfileEdit";

const { Title } = Typography;

const ProfilePage = () => {
    const [editing, setEditing] = useState(false);

    const profileData = {
        id: "1",
        firstName: "Иван",
        secondName: "Иванов",
        middleName: "Иванович",
        about: "Активный волонтер с 2020 года",
        birthday: "1996-06-15",
        city: "Новоуральск",
        sex: "male",
        email: "ivanov@example.com",
        phone: "+7 (999) 123-45-67",
    };

    const handleSave = (values: any) => {
        console.log("Save profile:", values);
        setEditing(false);
    };

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

                {editing ? (
                    <ProfileEdit
                        profileData={profileData}
                        onSave={handleSave}
                        onCancel={() => setEditing(false)}
                    />
                ) : (
                    <ProfileView profileData={profileData} />
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;
