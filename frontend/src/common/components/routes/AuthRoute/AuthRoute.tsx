import { Navigate } from "react-router-dom";

import useAppSelector from "@hooks/useAppSelector";

interface AuthRouteProps {
    children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);

    if (isAuthenticated && userType === "volunteer") {
        return <Navigate to="/profile" replace />;
    }

    if (isAuthenticated && userType === "npo") {
        return <Navigate to="/organization" replace />;
    }

    return <>{children}</>;
};

export default AuthRoute;
