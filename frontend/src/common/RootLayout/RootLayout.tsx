import { Divider, Flex, Layout, Menu, Typography, App, Drawer, Button } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import { GlobalOutlined, MenuOutlined } from "@ant-design/icons";
import { useLocation, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useMemo, useState, useEffect, useRef } from "react";

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
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
    const location = useLocation();
    const navigate = useNavigate();
    const { open } = useContext(ModalContext);
    const { currentCity } = useCity();
    const { message } = App.useApp();
    const shouldRedirectRef = useRef(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);

    // Редирект на главную при выходе из аккаунта
    useEffect(() => {
        if (shouldRedirectRef.current && !isAuthenticated) {
            shouldRedirectRef.current = false;
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const logoutHandler = () => {
        shouldRedirectRef.current = true;
        dispatch(logout());
        message.success("Вы успешно вышли из аккаунта");
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

    const menuContent = (
        <>
            {!isMobile && (
                <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Flex className="menu__logo-container">
                        <img
                            src="/logo-white.png"
                            alt="Logo"
                            className="menu__logo-container__image"
                        />
                        {!collapsed && (
                            <Title
                                level={4}
                                className="menu__logo-container__title"
                            >
                                Добрые дела
                            </Title>
                        )}
                    </Flex>
                </NavLink>
            )}
            {!isMobile && <Divider className="menu__divider" />}
            <Menu theme="dark" mode="inline" items={topItems} selectedKeys={topActiveKeyPath} onClick={() => setMobileMenuOpen(false)} />

            <div className="menu__gap" />

            {isAuthenticated && (
                <Menu
                    theme="dark"
                    mode="inline"
                    items={userMenuItems}
                    selectedKeys={userActiveKeyPath}
                    className="menu__bottom"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            {!isAuthenticated && (
                <Menu
                    theme="dark"
                    mode="inline"
                    items={authItems}
                    selectedKeys={authActiveKeyPath}
                    className="menu__bottom"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            <Menu
                theme="dark"
                mode="inline"
                selectable={false}
                items={cityItems}
                className="menu__bottom"
            />
        </>
    );

    return (
        <Layout>
            {!isMobile ? (
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} className="menu">
                    {menuContent}
                </Sider>
            ) : (
                <>
                    <Drawer
                        title={
                            <Flex align="center" gap={8}>
                                <img
                                    src="/logo-white.png"
                                    alt="Logo"
                                    style={{ width: 24, height: 24 }}
                                />
                                <span style={{ color: "#fff" }}>Добрые дела</span>
                            </Flex>
                        }
                        placement="left"
                        onClose={() => setMobileMenuOpen(false)}
                        open={mobileMenuOpen}
                        bodyStyle={{ padding: 0, backgroundColor: "#001529" }}
                        headerStyle={{ backgroundColor: "#001529", borderBottom: "none", padding: "16px" }}
                        width={280}
                        className="mobile-drawer"
                    >
                        {menuContent}
                    </Drawer>
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuOpen(true)}
                        className="mobile-menu-button"
                    />
                </>
            )}
            <Content className="content__wrapper">
                <Outlet />
            </Content>
        </Layout>
    );
};

export default RootLayout;
