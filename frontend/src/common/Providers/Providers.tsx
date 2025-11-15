import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { Outlet } from "react-router-dom";

const Providers = () => {
    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                token: {
                    fontFamily: "Rosatom, sans-serif",
                },
                components: {
                    Typography: {
                        titleMarginBottom: 0,
                    },
                },
            }}
        >
            <Outlet />
        </ConfigProvider>
    );
};

export default Providers;
