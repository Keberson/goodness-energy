import React from "react";
import { Descriptions, Tag, Space, Typography, Row, Col, Empty } from "antd";

import type { INPO } from "@app-types/npo.types";
import FilePreview from "@components/FilePreview/FilePreview";

const { Text, Paragraph, Title } = Typography;

interface NPOProfileViewProps {
    profileData: INPO;
}

const NPOProfileView: React.FC<NPOProfileViewProps> = ({ profileData }) => {
    const tagColors = {
        animals: "green",
        ecology: "blue",
        children: "orange",
        elderly: "purple",
        culture: "cyan",
    };

    return (
        <div>
            <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Название">
                    <Text strong>{profileData.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Описание">
                    <Paragraph>{profileData.description}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Адрес">{profileData.address}</Descriptions.Item>
                <Descriptions.Item label="Город">{profileData.city}</Descriptions.Item>
                {profileData.timetable && profileData.timetable.trim() && (
                    <Descriptions.Item label="Расписание">
                        <Paragraph>{profileData.timetable}</Paragraph>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Теги">
                    <Space wrap>
                        {profileData.tags.map((tag) => (
                            <Tag key={tag} color={tagColors[tag as keyof typeof tagColors] || "default"}>
                                {tag}
                            </Tag>
                        ))}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Вакансии">
                    <Tag color={profileData.vacancies > 0 ? "green" : "default"}>
                        {profileData.vacancies > 0 ? `${profileData.vacancies} открыто` : "Нет вакансий"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Дата создания">
                    {new Date(profileData.created_at).toLocaleDateString("ru-RU")}
                </Descriptions.Item>
                {profileData.links && Object.keys(profileData.links).length > 0 && (
                    <Descriptions.Item label="Ссылки">
                        {Object.entries(profileData.links).map(([key, url]) => (
                            <div key={key}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {url}
                                </a>
                            </div>
                        ))}
                    </Descriptions.Item>
                )}
            </Descriptions>

            <div>
                <Title level={4}>Галерея фотографий</Title>
                {profileData.galleryIds && profileData.galleryIds.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {profileData.galleryIds.map((fileId) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                <FilePreview fileId={fileId} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty description="Фотографии не загружены" />
                )}
            </div>
        </div>
    );
};

export default NPOProfileView;

