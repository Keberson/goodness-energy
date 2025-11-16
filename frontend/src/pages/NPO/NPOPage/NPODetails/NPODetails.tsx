import React from "react";
import { Descriptions, Tag, Space, Typography } from "antd";

import type { INPO } from "@app-types/npo.types";

const { Text, Paragraph } = Typography;

interface NPODetailsProps {
    npo: INPO;
}

const NPODetails: React.FC<NPODetailsProps> = ({ npo }) => {
    const tagColors = {
        animals: "green",
        ecology: "blue",
        children: "orange",
        elderly: "purple",
        culture: "cyan",
    };

    return (
        <Descriptions column={1} bordered>
            <Descriptions.Item label="Название">
                <Text strong>{npo.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Описание">
                <Paragraph>{npo.description}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Адрес">{npo.address}</Descriptions.Item>
            <Descriptions.Item label="Теги">
                <Space wrap>
                    {npo.tags.map((tag) => (
                        <Tag key={tag} color={tagColors[tag as keyof typeof tagColors]}>
                            {tag}
                        </Tag>
                    ))}
                </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Вакансии">
                <Tag color={npo.vacancies > 0 ? "green" : "default"}>
                    {npo.vacancies > 0 ? `${npo.vacancies} открыто` : "Нет вакансий"}
                </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
                {new Date(npo.created_at).toLocaleDateString("ru-RU")}
            </Descriptions.Item>
            {npo.links && Object.keys(npo.links).length > 0 && (
                <Descriptions.Item label="Ссылки">
                    {Object.entries(npo.links).map(([key, url]) => (
                        <div key={key}>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                {url}
                            </a>
                        </div>
                    ))}
                </Descriptions.Item>
            )}
        </Descriptions>
    );
};

export default NPODetails;
