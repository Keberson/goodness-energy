import { Table, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { getNPOColumns } from "./props";

import { useGetNPOsQuery } from "@services/api/npo.api";
import type { INPO } from "@app-types/npo.types";
import { useCity } from "@hooks/useCity";

const { Title } = Typography;

const NPOListPage = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useGetNPOsQuery();
    const { currentCity } = useCity();

    const columns = getNPOColumns(navigate);

    return (
        <div style={{ padding: 24, minHeight: "calc(100vh - 48px)" }}>
            <Card style={{ minHeight: "calc(100vh - 96px)" }}>
                <Title level={3} style={{ marginBottom: 24 }}>
                    Некоммерческие организации в городе {currentCity}
                </Title>
                <Table<INPO>
                    columns={columns}
                    dataSource={(data ?? [])
                        .map((item) => ({ ...item, key: item.id }))
                        .filter((item) => item.city === currentCity)}
                    loading={isLoading}
                    scroll={{ x: 1200 }}
                    tableLayout="fixed"
                />
            </Card>
        </div>
    );
};

export default NPOListPage;
