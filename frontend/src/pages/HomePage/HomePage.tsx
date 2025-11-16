import { Card, Row, Col, Typography, Button, Tag, Flex, Calendar } from "antd";
import {
    EnvironmentOutlined,
    TeamOutlined,
    CalendarOutlined,
    ReadOutlined,
    ArrowRightOutlined,
    NotificationOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { NavLink } from "react-router-dom";

const { Title, Paragraph } = Typography;

import "./styles.scss";

const HomePage = () => {
    const features = [
        {
            icon: <EnvironmentOutlined />,
            title: "Карта",
            description: "Найти организации по городу и направлению деятельности",
            link: "map",
        },
        {
            icon: <TeamOutlined />,
            title: "НКО",
            description: "Узнать о волонтёрских проектах в вашем городе",
            link: "npo",
        },
        {
            icon: <CalendarOutlined />,
            title: "Календарь",
            description: "Отметьте интересные события, чтобы ничего не пропустить",
            link: "",
        },
        {
            icon: <ReadOutlined />,
            title: "База знаний",
            description: "Просматривайте видео и материалы для скачивания",
            link: "",
        },
        {
            icon: <NotificationOutlined />,
            title: "Новости",
            description: "Будьте в курсе последних инициатив и грантов",
            link: "news",
        },
    ];

    const getListData = (value: Dayjs) => {
        let listData: { type: string; content: string }[] = [];

        if (value.date() === 15) {
            listData = [
                { type: "warning", content: "Субботник в парке" },
                { type: "success", content: "Сбор вещей" },
            ];
        }
        if (value.date() === 20) {
            listData = [{ type: "success", content: "Благотворительный концерт" }];
        }
        return listData;
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <div className="home__events__cell">
                {listData.map((item, index) => (
                    <Tag
                        key={index}
                        color={item.type === "warning" ? "orange" : "green"}
                        style={{ margin: "1px", fontSize: "10px" }}
                    >
                        {item.content}
                    </Tag>
                ))}
            </div>
        );
    };

    return (
        <div className="home__container">
            <Card className="home__header">
                <Row gutter={[32, 32]} align="middle">
                    <Col xs={24} md={14}>
                        <Title level={1} className="home__header__title">
                            Добрые дела Росатома
                        </Title>
                        <Title level={3}>Все инициативы вашего города в одном месте</Title>
                        <Paragraph className="home__header__description">
                            Единый портал для жителей, волонтёров и НКО, где собрана вся информация
                            о социальных, экологических, культурных, образовательных и спортивных
                            инициативах в городах присутствия Росатома.
                        </Paragraph>

                        <Title level={4} className="home__header__subtitle">
                            Станьте частью добрых дел в вашем городе!
                        </Title>
                    </Col>

                    <Col xs={24} md={10}>
                        <img
                            src="/images/home.jpg"
                            alt="Волонтёры"
                            className="home__header__image"
                        />
                    </Col>
                </Row>
            </Card>

            <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
                Здесь вы сможете:
            </Title>

            <Row gutter={[16, 16]} className="home__features">
                {features.map((feature, index) => (
                    <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                            hoverable
                            className="home__feature-card"
                            actions={[
                                <NavLink to={feature.link}>
                                    <Button type="link" icon={<ArrowRightOutlined />}>
                                        Перейти
                                    </Button>
                                </NavLink>,
                            ]}
                        >
                            <Card.Meta
                                avatar={<div className="home__feature-avatar">{feature.icon}</div>}
                                title={feature.title}
                                description={feature.description}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card
                title={
                    <Flex align="center" gap={8}>
                        <CalendarOutlined />
                        Ближайшие события
                    </Flex>
                }
                className="home__events"
            >
                <Calendar cellRender={dateCellRender} />
                <Button type="primary" className="home__events__view-all" block>
                    Смотреть все события
                </Button>
            </Card>

            <Card
                title={
                    <Flex align="center" gap={8}>
                        <PlayCircleOutlined />
                        Быстрый старт
                    </Flex>
                }
            >
                <Paragraph strong>Начните делать добрые дела уже сегодня!</Paragraph>
                <Paragraph>
                    Выберите подходящий способ участия и присоединяйтесь к сообществу волонтёров и
                    активистов вашего города.
                </Paragraph>

                <Flex vertical gap={12} className="home__quick-actions">
                    <Button type="primary" size="large" icon={<TeamOutlined />}>
                        Стать волонтёром
                    </Button>
                    <Button size="large" icon={<EnvironmentOutlined />}>
                        Найти организации на карте
                    </Button>
                    <Button size="large" icon={<ReadOutlined />}>
                        Изучить материалы
                    </Button>
                </Flex>
            </Card>
        </div>
    );
};

export default HomePage;
