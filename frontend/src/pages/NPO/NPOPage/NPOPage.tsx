// import { useState } from "react";
import { Card, Tabs, Typography } from "antd";
// import { EditOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";

import NPODetails from "./NPODetails/NPODetails";
// import NPOEdit from "./NPOEdit/NPOEdit";

import { useGetNPOByIdQuery } from "@services/api/npo.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NPOPage = () => {
    const { id } = useParams();
    // const [editing, setEditing] = useState(false);
    const { data } = useGetNPOByIdQuery(Number(id!));

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                        }}
                    >
                        <Title level={2}>{data.name}</Title>
                        {/* <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditing(!editing)}
                        >
                            {editing ? "Отменить" : "Редактировать"}
                        </Button> */}
                    </div>

                    {/* {editing ? (
                        <NPOEdit
                            data={data}
                            onCancel={() => setEditing(false)}
                        />
                    ) : ( */}
                    <Tabs defaultActiveKey="info">
                        <TabPane tab="Информация" key="info">
                            <NPODetails npo={data} />
                        </TabPane>
                        <TabPane tab="Галерея" key="gallery">
                            {/* Компонент галереи */}
                        </TabPane>
                        <TabPane tab="Вакансии" key="vacancies">
                            <Text type="secondary">Раздел находится в разработке</Text>
                        </TabPane>
                    </Tabs>
                    {/* )} */}
                </Card>
            )}
        </div>
    );
};

export default NPOPage;
