import React from "react";
import { Descriptions, Tag, Space, Typography, Row, Col, Empty } from "antd";

import type { INPO } from "@app-types/npo.types";
import FilePreview from "@components/FilePreview/FilePreview";

const { Text, Paragraph, Title } = Typography;

interface NPODetailsProps {
    npo: INPO;
    showGallery?: boolean;
}

const NPODetails: React.FC<NPODetailsProps> = ({ npo, showGallery = false }) => {
    const tagColors = {
        animals: "green",
        ecology: "blue",
        children: "orange",
        elderly: "purple",
        culture: "cyan",
    };

    if (showGallery) {
        return (
            <div>
                <Title level={4}>Галерея фотографий</Title>
                {npo.galleryIds && npo.galleryIds.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {npo.galleryIds.map((fileId) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                <FilePreview fileId={fileId} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty description="Фотографии не загружены" />
                )}
            </div>
        );
    }

    return (
        <Descriptions column={1} bordered>
            <Descriptions.Item label="Название">
                <Text strong>{npo.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Описание">
                <Paragraph>{npo.description}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Адрес">{npo.address}</Descriptions.Item>
            <Descriptions.Item label="Город">{npo.city}</Descriptions.Item>
            {npo.timetable && npo.timetable.trim() && (
                <Descriptions.Item label="Расписание">
                    <Paragraph>{npo.timetable}</Paragraph>
                </Descriptions.Item>
            )}
            <Descriptions.Item label="Теги">
                <Space wrap>
                    {npo.tags.map((tag) => (
                        <Tag key={tag} color={tagColors[tag as keyof typeof tagColors] || "default"}>
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
