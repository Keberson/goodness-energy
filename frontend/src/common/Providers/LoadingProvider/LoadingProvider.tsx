import type React from "react";
import { Spin } from "antd";

import useAppSelector from "@hooks/useAppSelector";

import type ProviderProps from "../Provider.interface";

const LoadingProvider: React.FC<ProviderProps> = ({ children }) => {
    const spinning = useAppSelector((state) => state.loading.isLoading);

    return (
        <>
            <Spin spinning={spinning} fullscreen />
            {children}
        </>
    );
};

export default LoadingProvider;
