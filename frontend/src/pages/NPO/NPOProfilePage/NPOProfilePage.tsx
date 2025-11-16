import { useState } from "react";
import { Card, Button, Flex, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";

import NPOProfileView from "./NPOProfileView/NPOProfileView";
import NPOProfileEdit from "./NPOProfileEdit/NPOProfileEdit";

import { useGetNPOByIdQuery } from "@services/api/npo.api";
import useAppSelector from "@hooks/useAppSelector";
import { skipToken } from "@reduxjs/toolkit/query";

const { Title } = Typography;

const NPOProfilePage = () => {
    const [editing, setEditing] = useState(false);
    const userId = useAppSelector((state) => state.auth.userId);
    const { data } = useGetNPOByIdQuery(userId ?? skipToken);

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
                    <Title level={2}>Личный кабинет организации</Title>
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
                    <NPOProfileEdit
                        profileData={data}
                        onCancel={() => setEditing(false)}
                    />
                )}
                {data && !editing && <NPOProfileView profileData={data} />}
            </Card>
        </div>
    );
};

export default NPOProfilePage;

