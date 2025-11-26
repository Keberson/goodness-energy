import React from "react";
import { Descriptions, Tag, Space, Typography, Row, Col, Empty, Alert, Card } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

import type { INPO } from "@app-types/npo.types";
import FilePreview from "@components/FilePreview/FilePreview";
import NewsContent from "@components/NewsContent/NewsContent";

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
                    {profileData.description && profileData.description.trim() ? (
                        <Paragraph>{profileData.description}</Paragraph>
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Адрес">
                    {profileData.address && profileData.address.trim() ? (
                        profileData.address
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Город">
                    {profileData.city && profileData.city.trim() ? (
                        profileData.city
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Расписание">
                    {profileData.timetable && profileData.timetable.trim() ? (
                        <Paragraph>{profileData.timetable}</Paragraph>
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Теги">
                    {profileData.tags && profileData.tags.length > 0 ? (
                        <Space wrap>
                            {profileData.tags.map((tag) => (
                                <Tag key={tag} color={tagColors[tag as keyof typeof tagColors] || "default"}>
                                    {tag}
                                </Tag>
                            ))}
                        </Space>
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Дата создания">
                    {new Date(profileData.created_at).toLocaleDateString("ru-RU")}
                </Descriptions.Item>
                <Descriptions.Item label="Ссылки">
                    {profileData.links && Object.keys(profileData.links).length > 0 ? (
                        Object.entries(profileData.links).map(([key, url]) => (
                            <div key={key}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {url}
                                </a>
                            </div>
                        ))
                    ) : (
                        <Text type="secondary" italic>Данных нет</Text>
                    )}
                </Descriptions.Item>
            </Descriptions>

            {profileData.page_content && profileData.page_content.trim() && (
                <div style={{ marginBottom: 24 }}>
                    <Title level={4}>
                        <FileTextOutlined /> Страница профиля
                    </Title>
                    <Alert
                        message="У вас настроена кастомная страница профиля"
                        description="При просмотре вашего профиля будет отображаться кастомная страница вместо стандартного шаблона. Вы можете редактировать её во вкладке 'Страница профиля' при редактировании."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Card>
                        <NewsContent
                            html={profileData.page_content}
                            style={{
                                fontSize: 14,
                                lineHeight: 1.6,
                            }}
                        />
                    </Card>
                </div>
            )}

            <div>
                <Title level={4}>Галерея фотографий</Title>
                {profileData.galleryIds && profileData.galleryIds.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {profileData.galleryIds.map((fileId) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                <FilePreview fileId={fileId} hideFileName={true} />
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

