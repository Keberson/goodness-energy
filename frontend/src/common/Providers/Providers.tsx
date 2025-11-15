import { App, ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";

import LoadingProvider from "./LoadingProvider/LoadingProvider";
import ModalProvider from "./ModalProvider/ModalProvider";

import { store } from "@services/store.service";

const Providers = () => {
    return (
        <App>
            <Provider store={store}>
                <ConfigProvider
                    locale={{
                        ...ruRU,
                        DatePicker: {
                            ...ruRU.DatePicker!,
                            lang: {
                                ...ruRU.DatePicker!.lang,
                                fieldDateFormat: "DD.MM.YYYY",
                            },
                        },
                    }}
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
                    <LoadingProvider>
                        <ModalProvider>
                            <Outlet />
                        </ModalProvider>
                    </LoadingProvider>
                </ConfigProvider>
            </Provider>
        </App>
    );
};

export default Providers;
