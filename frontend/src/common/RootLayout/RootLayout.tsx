import { Divider, Flex, Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import "./styles.scss";

import {
    volunteerMenuItems,
    cityMenuItems,
    mapMenuItems,
    topMenuItems,
    authMenuItems,
} from "./props";

const { Sider, Content } = Layout;
const { Title } = Typography;

type RootLayoutKeys = "/" | "map" | "npo" | "events" | "news" | "knowledges";

const RootLayout = () => {
    const [selectedKey, setSelectedKey] = useState<RootLayoutKeys>("/");
    const [collapsed, setCollapsed] = useState<boolean>(true);

    const openCityChange = () => {
        console.log("city change modal");
    };

    const topItems = mapMenuItems(topMenuItems);
    const volunteerItems = mapMenuItems(volunteerMenuItems); // npoMenuItems adminMenuItems
    const cityItems = mapMenuItems(cityMenuItems, { city: openCityChange });
    const authItems = mapMenuItems(authMenuItems);

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
                <Menu theme="dark" mode="inline" items={topItems} selectedKeys={[selectedKey]} />
                <div className="menu__gap" />
                <Menu
                    theme="dark"
                    mode="inline"
                    items={authItems}
                    selectedKeys={[selectedKey]}
                    className="menu__bottom"
                />
                <Menu
                    theme="dark"
                    mode="inline"
                    items={cityItems}
                    selectable={false}
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
