import { Card, Tabs, Typography } from "antd";
import { useParams } from "react-router-dom";

import NPODetails from "./NPODetails/NPODetails";

import { useGetNPOByIdQuery } from "@services/api/npo.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NPOPage = () => {
    const { id } = useParams();
    const { data } = useGetNPOByIdQuery(Number(id!));

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card>
                    <Title level={2} style={{ marginBottom: 24 }}>
                        {data.name}
                    </Title>

                    <Tabs defaultActiveKey="info">
                        <TabPane tab="Информация" key="info">
                            <NPODetails npo={data} />
                        </TabPane>
                        <TabPane tab="Галерея" key="gallery">
                            <NPODetails npo={data} showGallery />
                        </TabPane>
                        <TabPane tab="Вакансии" key="vacancies">
                            <Text type="secondary">Раздел находится в разработке</Text>
                        </TabPane>
                    </Tabs>
                </Card>
            )}
        </div>
    );
};

export default NPOPage;
