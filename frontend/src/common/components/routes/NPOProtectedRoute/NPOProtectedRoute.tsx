import { Navigate, useLocation } from "react-router-dom";

import useAppSelector from "@hooks/useAppSelector";

const NPOProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const userType = useAppSelector((state) => state.auth.userType);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userType !== "npo") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default NPOProtectedRoute;

