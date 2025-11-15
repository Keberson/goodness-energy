import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import "./styles.scss";

const { Title, Text } = Typography;

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="auth-layout">
            <div className="auth-layout__container">
                <div className="auth-layout__left">
                    <div className="auth-layout__brand">
                        <img
                            src="/logo-white.png"
                            alt="Rosatom Logo"
                            className="auth-layout__logo"
                        />
                        <Title level={2} className="auth-layout__title">
                            Добрые дела Росатома
                        </Title>
                    </div>
                    <Text className="auth-layout__subtitle">
                        Единый портал для волонтёров и НКО
                    </Text>
                </div>

                <div className="auth-layout__right">
                    <Card className="auth-layout__card">{children}</Card>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
