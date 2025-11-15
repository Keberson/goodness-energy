import { Navigate, useLocation } from "react-router-dom";

import useAppSelector from "@hooks/useAppSelector";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
