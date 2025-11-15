import { type TableColumnsType, Tag, Button, Space, Typography, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";

import type { INPO } from "@app-types/npo.types";
import type { NavigateFunction } from "react-router-dom";

const { Text, Paragraph } = Typography;

const getTagLabel = (tag: string) => {
    const labels: Record<string, string> = {
        animals: "Животные",
        ecology: "Экология",
        children: "Дети",
        elderly: "Пожилые",
        culture: "Культура",
    };
    return labels[tag] || tag;
};

export const getNPOColumns = (navigate: NavigateFunction): TableColumnsType<INPO> => [
    {
        title: "Название",
        dataIndex: "name",
        key: "name",
        width: 200,
        fixed: "left",
        render: (name: string) => <Text strong>{name}</Text>,
    },
    {
        title: "Описание",
        dataIndex: "description",
        key: "description",
        width: 400,
        render: (description: string | null) => (
            <Paragraph
                style={{ margin: 0, fontSize: "13px" }}
                ellipsis={{ rows: 2, expandable: "collapsible" }}
            >
                {description || "Нет описания"}
            </Paragraph>
        ),
    },
    {
        title: "Теги",
        dataIndex: "tags",
        key: "tags",
        width: 200,
        render: (tags: string[]) => (
            <Space wrap size={[4, 4]}>
                {tags.map((tag) => (
                    <Tag
                        style={{
                            maxWidth: "200px",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            height: "auto",
                        }}
                    >
                        <Tooltip title={getTagLabel(tag)}>{getTagLabel(tag)}</Tooltip>
                    </Tag>
                ))}
            </Space>
        ),
    },
    {
        title: "Вакансии",
        dataIndex: "vacancies",
        key: "vacancies",
        width: 120,
        align: "center" as const,
        render: (vacancies: number) => (
            <Tag color={vacancies > 0 ? "green" : "default"}>
                {vacancies > 0 ? `${vacancies} открыто` : "Нет вакансий"}
            </Tag>
        ),
    },
    {
        title: "Действия",
        key: "actions",
        width: 200,
        align: "center" as const,
        fixed: "right",
        render: (_, record: INPO) => (
            <Space>
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/npo/${record.id}`)}
                >
                    Подробнее
                </Button>
            </Space>
        ),
    },
];
