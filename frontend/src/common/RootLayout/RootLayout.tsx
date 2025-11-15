import { Divider, Flex, Layout, Menu, Typography } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import { GlobalOutlined } from "@ant-design/icons";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { useContext, useMemo, useState } from "react";

import "./styles.scss";

import { useCity } from "@hooks/useCity";
import ModalContext from "@contexts/ModalContext";

import {
    volunteerMenuItems,
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
    const volunteerItems = mapMenuItems(volunteerMenuItems); // npoMenuItems adminMenuItems
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

    const activeKeyPath = useMemo(
        () => findActiveMenuKeyPath([...topItems, ...authItems, ...cityItems], location.pathname),
        [location]
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
                <Menu theme="dark" mode="inline" items={topItems} selectedKeys={activeKeyPath} />
                <div className="menu__gap" />
                <Menu
                    theme="dark"
                    mode="inline"
                    items={authItems}
                    selectedKeys={activeKeyPath}
                    className="menu__bottom"
                />
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
