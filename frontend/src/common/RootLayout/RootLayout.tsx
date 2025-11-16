import { Divider, Flex, Layout, Menu, Typography } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import { GlobalOutlined } from "@ant-design/icons";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { useContext, useMemo, useState } from "react";

import "./styles.scss";

import { useCity } from "@hooks/useCity";
import ModalContext from "@contexts/ModalContext";
import useAppSelector from "@hooks/useAppSelector";
import useAppDispatch from "@hooks/useAppDispatch";
import { logout } from "@services/slices/auth.slice";

import {
    volunteerMenuItems,
    npoMenuItems,
    adminMenuItems,
    mapMenuItems,
    topMenuItems,
    authMenuItems,
    findActiveMenuKeyPath,
} from "./props";
import CityModal from "./CityModal/CityModal";

const { Sider, Content } = Layout;
const { Title } = Typography;

const RootLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const location = useLocation();
    const { open } = useContext(ModalContext);
    const { currentCity } = useCity();

    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);

    const logoutHandler = () => {
        dispatch(logout());
    };

    const openCityChange = () => {
        open({
            content: <CityModal />,
            props: {
                title: (
                    <Flex align="center" gap={8}>
                        <GlobalOutlined /> Выбор города
                    </Flex>
                ),
                footer: <></>,
            },
        });
    };

    const topItems = mapMenuItems(topMenuItems);
    
    const userMenuItems = useMemo(() => {
        if (!isAuthenticated || !userType) return [];
        
        switch (userType) {
            case "volunteer":
                return mapMenuItems(volunteerMenuItems, { logout: logoutHandler });
            case "npo":
                return mapMenuItems(npoMenuItems, { logout: logoutHandler });
            case "admin":
                return mapMenuItems(adminMenuItems, { logout: logoutHandler });
            default:
                return [];
        }
    }, [isAuthenticated, userType, logoutHandler]);
    
    const cityItems: ItemType[] = useMemo(
        () => [
            {
                key: "city",
                icon: <GlobalOutlined />,
                label: currentCity,
                onClick: () => openCityChange(),
            },
        ],
        [currentCity]
    );
    const authItems = mapMenuItems(authMenuItems);

    // Вычисляем отдельные activeKeyPath для каждого меню, чтобы избежать коллизий
    const topActiveKeyPath = useMemo(
        () => findActiveMenuKeyPath(topItems, location.pathname),
        [location, topItems]
    );

    const userActiveKeyPath = useMemo(
        () => findActiveMenuKeyPath(userMenuItems, location.pathname),
        [location, userMenuItems]
    );

    const authActiveKeyPath = useMemo(
        () => findActiveMenuKeyPath(authItems, location.pathname),
        [location, authItems]
    );

    return (
        <Layout>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} className="menu">
                <NavLink to="/">
                    <Flex className="menu__logo-container">
                        <img
                            src="/logo-white.png"
                            alt="Logo"
                            className="menu__logo-container__image"
                        />
                        {!collapsed && (
                            <Title
                                level={4}
                                className={`menu__logo-container__title ${
                                    collapsed && "collapsed"
                                }`}
                            >
                                Добрые дела
                            </Title>
                        )}
                    </Flex>
                </NavLink>
                <Divider className="menu__divider" />
                <Menu theme="dark" mode="inline" items={topItems} selectedKeys={topActiveKeyPath} />

                <div className="menu__gap" />

                {isAuthenticated && (
                    <Menu
                        theme="dark"
                        mode="inline"
                        items={userMenuItems}
                        selectedKeys={userActiveKeyPath}
                        className="menu__bottom"
                    />
                )}
                {!isAuthenticated && (
                    <Menu
                        theme="dark"
                        mode="inline"
                        items={authItems}
                        selectedKeys={authActiveKeyPath}
                        className="menu__bottom"
                    />
                )}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectable={false}
                    items={cityItems}
                    className="menu__bottom"
                />
            </Sider>
            <Content className="content__wrapper">
                <Outlet />
            </Content>
        </Layout>
    );
};

export default RootLayout;
