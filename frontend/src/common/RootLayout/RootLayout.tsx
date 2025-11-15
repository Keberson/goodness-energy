import { Divider, Flex, Layout, Menu, Typography } from "antd";
import { useLocation, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

import "./styles.scss";

import {
    volunteerMenuItems,
    cityMenuItems,
    mapMenuItems,
    topMenuItems,
    authMenuItems,
    findActiveMenuKeyPath,
} from "./props";

const { Sider, Content } = Layout;
const { Title } = Typography;

const RootLayout = () => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const location = useLocation();
    const pathname = location.pathname;

    const openCityChange = () => {
        console.log("city change modal");
    };

    const topItems = mapMenuItems(topMenuItems);
    const volunteerItems = mapMenuItems(volunteerMenuItems); // npoMenuItems adminMenuItems
    const cityItems = mapMenuItems(cityMenuItems, { city: openCityChange });
    const authItems = mapMenuItems(authMenuItems);

    const activeKeyPath = findActiveMenuKeyPath(
        [...topItems, ...authItems, ...cityItems],
        pathname
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
                    items={cityItems}
                    selectedKeys={activeKeyPath}
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
