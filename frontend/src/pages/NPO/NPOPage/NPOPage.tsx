import { Card, Tabs, Typography, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";

import NPODetails from "./NPODetails/NPODetails";

import { useGetNPOByIdQuery, useRegisterNPOViewMutation } from "@services/api/npo.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NPOPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const npoId = Number(id!);
    const { data } = useGetNPOByIdQuery(npoId);
    const [registerView] = useRegisterNPOViewMutation();

    useEffect(() => {
        if (npoId) {
            // Регистрируем просмотр профиля НКО
            registerView(npoId).catch(() => {
                // Игнорируем ошибки при регистрации просмотра
            });
        }
    }, [npoId, registerView]);

    return (
        <div style={{ padding: 24 }}>
            {data && (
                <Card>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/npo")}
                        style={{ marginBottom: 16, padding: 0 }}
                    >
                        Назад к списку НКО
                    </Button>
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
