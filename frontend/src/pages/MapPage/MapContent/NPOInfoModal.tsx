import React from "react";
import { Descriptions, Tag, Space, Typography, Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";

import type { IMapItem } from "@app-types/map.types";
import FilePreview from "@components/FilePreview/FilePreview";

const { Text, Paragraph, Title } = Typography;

interface NPOInfoModalProps {
    npoInfo: IMapItem["info"];
    onClose: () => void;
}

const NPOInfoModal: React.FC<NPOInfoModalProps> = ({ npoInfo, onClose }) => {
    const navigate = useNavigate();
    const tagColors = {
        animals: "green",
        ecology: "blue",
        children: "orange",
        elderly: "purple",
        culture: "cyan",
    };

    if (!npoInfo) {
        return <div>Информация об НКО не найдена</div>;
    }

    return (
        <div style={{ padding: "16px", width: "100%", minHeight: "200px" }}>
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Название">
                    <Text strong>{npoInfo.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Описание">
                    <Paragraph>{npoInfo.description}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Адрес">{npoInfo.address}</Descriptions.Item>
                {npoInfo.timetable && npoInfo.timetable.trim() && (
                    <Descriptions.Item label="Расписание">
                        <Paragraph>{npoInfo.timetable}</Paragraph>
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="Теги">
                    <Space wrap>
                        {npoInfo.tags && npoInfo.tags.length > 0 ? (
                            npoInfo.tags.map((tag) => (
                                <Tag key={tag} color={tagColors[tag as keyof typeof tagColors] || "default"}>
                                    {tag}
                                </Tag>
                            ))
                        ) : (
                            <Text type="secondary">Теги не указаны</Text>
                        )}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Вакансии">
                    <Tag color={npoInfo.vacancies > 0 ? "green" : "default"}>
                        {npoInfo.vacancies > 0 ? `${npoInfo.vacancies} открыто` : "Нет вакансий"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Дата создания">
                    {new Date(npoInfo.created_at).toLocaleDateString("ru-RU")}
                </Descriptions.Item>
                {npoInfo.links && Object.keys(npoInfo.links).length > 0 && (
                    <Descriptions.Item label="Ссылки">
                        {Object.entries(npoInfo.links).map(([key, url]) => (
                            <div key={key}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {url}
                                </a>
                            </div>
                        ))}
                    </Descriptions.Item>
                )}
            </Descriptions>

            {npoInfo.galleryIds && npoInfo.galleryIds.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <Title level={4}>Галерея фотографий</Title>
                    <Row gutter={[16, 16]}>
                        {npoInfo.galleryIds.map((fileId) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={fileId}>
                                <FilePreview fileId={fileId} />
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            <div style={{ marginTop: 24, textAlign: "center" }}>
                <Button
                    type="primary"
                    onClick={() => {
                        onClose();
                        navigate(`/npo/${npoInfo.id}`);
                    }}
                >
                    Подробнее об НКО
                </Button>
            </div>
        </div>
    );
};

export default NPOInfoModal;

