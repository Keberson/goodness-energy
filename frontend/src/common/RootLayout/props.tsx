import {
    CalendarOutlined,
    EnvironmentOutlined,
    NotificationOutlined,
    HomeOutlined,
    ReadOutlined,
    TeamOutlined,
    UserOutlined,
    IdcardOutlined,
    HistoryOutlined,
    GlobalOutlined,
    ShopOutlined,
    EditOutlined,
    BarChartOutlined,
    SafetyCertificateOutlined,
    LoginOutlined,
    LogoutOutlined,
    StarOutlined,
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
        key: "volunteer-posts",
        label: "Истории волонтеров",
        icon: <HistoryOutlined />,
    },
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
];

export const volunteerMenuItems: MenuItem[] = [
    {
        key: "volunteer",
        label: "Профиль",
        icon: <UserOutlined />,
        children: [
            {
                key: "profile",
                icon: <IdcardOutlined />,
                label: "Личные данные",
            },
            {
                key: "my-events",
                icon: <HistoryOutlined />,
                label: "Мои события",
            },
            {
                key: "favorites",
                icon: <StarOutlined />,
                label: "Избранное",
            },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Выйти",
                link: false,
            },
        ],
    },
];

export const npoMenuItems: MenuItem[] = [
    {
        key: "npo-profile",
        label: "Профиль",
        icon: <ShopOutlined />,
        children: [
            {
                key: "org",
                icon: <ShopOutlined />,
                label: "Моя организация",
            },
            {
                key: "manage-events",
                icon: <EditOutlined />,
                label: "Управление событиями",
            },
            {
                key: "statistics",
                icon: <BarChartOutlined />,
                label: "Статистика",
            },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Выйти",
                link: false,
            },
        ],
    },
];

export const adminMenuItems: MenuItem[] = [
    {
        key: "admin",
        label: "Администрирование",
        icon: <SafetyCertificateOutlined />,
        children: [
            {
                key: "moderation",
                icon: <SafetyCertificateOutlined />,
                label: "Модерация",
            },
            {
                key: "admin-statistics",
                icon: <BarChartOutlined />,
                label: "Статистика НКО",
            },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Выйти",
                link: false,
            },
        ],
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
        key: "login",
        label: "Авторизация",
        icon: <LoginOutlined />,
    },
];

export const mapMenuItems = (
    items: MenuItem[],
    handlers?: Record<string, () => void>,
    parentKey?: string
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
        children: item.children
            ? mapMenuItems(
                  item.children,
                  handlers,
                  parentKey ? `${parentKey}/${item.key}` : item.key
              )
            : undefined,
        onClick: handlers && item.key in handlers ? handlers[item.key] : undefined,
    }));

export const findActiveMenuKeyPath = (items: any[], pathname: string): string[] => {
    for (const item of items) {
        if (item.key === pathname || (item.key !== "/" && pathname.startsWith(item.key + "/"))) {
            return [item.key];
        }

        if (item.children) {
            const childPath = findActiveMenuKeyPath(item.children, pathname);

            if (childPath.length) {
                return [item.key, ...childPath];
            }
        }

        // Только если нет дочерних элементов или они не совпали, проверяем сам элемент
        // Точное совпадение
        if (item.key === pathname) {
            return [item.key];
        }

        // Проверяем, что путь начинается с ключа + "/"
        // Например: /npo/123 должен совпадать с /npo
        // Но /npo-profile НЕ должен совпадать с /npo, так как после /npo идет "-", а не "/"
        if (item.key !== "/" && pathname.startsWith(item.key + "/")) {
            return [item.key];
        }
    }

    return [];
};
