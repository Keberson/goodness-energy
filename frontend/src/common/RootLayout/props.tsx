import {
    CalendarOutlined,
    EnvironmentOutlined,
    NotificationOutlined,
    HomeOutlined,
    ReadOutlined,
    TeamOutlined,
    BulbOutlined,
    UserOutlined,
    IdcardOutlined,
    HistoryOutlined,
    GlobalOutlined,
    ShopOutlined,
    EditOutlined,
    BarChartOutlined,
    SafetyCertificateOutlined,
    UsergroupAddOutlined,
    LoginOutlined,
    UserAddOutlined,
} from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface MenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    children?: MenuItem[];
    link?: boolean;
}

export const topMenuItems: MenuItem[] = [
    {
        key: "",
        label: "Главная",
        icon: <HomeOutlined />,
    },
    {
        key: "map",
        label: "Карта",
        icon: <EnvironmentOutlined />,
    },
    {
        key: "npo",
        label: "Организации",
        icon: <TeamOutlined />,
    },
    {
        key: "events",
        label: "События",
        icon: <CalendarOutlined />,
    },
    {
        key: "content",
        label: "Контент",
        icon: <BulbOutlined />,
        children: [
            {
                key: "news",
                label: "Новости",
                icon: <NotificationOutlined />,
            },
            {
                key: "knowledges",
                label: "База знаний",
                icon: <ReadOutlined />,
            },
        ],
    },
];

export const volunteerMenuItems: MenuItem[] = [
    {
        key: "profile",
        label: "Профиль",
        icon: <UserOutlined />,
        children: [
            {
                key: "info",
                icon: <IdcardOutlined />,
                label: "Личные данные",
            },
            {
                key: "my-events",
                icon: <HistoryOutlined />,
                label: "Мои события",
            },
        ],
    },
];

export const npoMenuItems: MenuItem[] = [
    {
        key: "/my-organization",
        icon: <ShopOutlined />,
        label: "Моя организация",
    },
    {
        key: "/manage-events",
        icon: <EditOutlined />,
        label: "Управление событиями",
    },
    {
        key: "/stats",
        icon: <BarChartOutlined />,
        label: "Статистика",
    },
];

export const adminMenuItems: MenuItem[] = [
    {
        key: "/moderation",
        icon: <SafetyCertificateOutlined />,
        label: "Модерация",
    },
    {
        key: "/users",
        icon: <UsergroupAddOutlined />,
        label: "Пользователи",
    },
];

export const cityMenuItems: MenuItem[] = [
    {
        key: "city",
        label: "Смена города",
        icon: <GlobalOutlined />,
        link: false,
    },
];

export const authMenuItems: MenuItem[] = [
    {
        key: "auth",
        label: "Авторизация",
        icon: <UserOutlined />,
        children: [
            {
                key: "login",
                label: "Войти",
                icon: <LoginOutlined />,
            },
            {
                key: "register",
                label: "Регистрация",
                icon: <UserAddOutlined />,
            },
        ],
    },
];

export const mapMenuItems = (
    items: MenuItem[],
    handlers?: Record<string, () => void>
): ItemType[] =>
    items.map((item) => ({
        key: `/${item.key}`,
        label:
            item.link === false || item.children ? (
                item.label
            ) : (
                <NavLink to={`/${item.key}`}>{item.label}</NavLink>
            ),
        icon: item.icon,
        children: item.children ? mapMenuItems(item.children) : undefined,
        onClick: handlers && item.key in handlers ? handlers[item.key] : undefined,
    }));
