import { createBrowserRouter } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";

import AuthRoute from "@components/routes/AuthRoute/AuthRoute";
import ProtectedRoute from "@components/routes/ProtectedRoute/ProtectedRoute";

import RootLayout from "./common/RootLayout/RootLayout";
import Providers from "./common/Providers/Providers";

import LoginPage from "./pages/Auth/LoginPage/LoginPage";
import RegistrationPage from "./pages/Auth/RegistrationPage/RegistrationPage";
import ProfilePage from "./pages/Volunteer/ProfilePage/ProfilePage";
import MapPage from "./pages/MapPage/MapPage";
import NPOListPage from "./pages/NPO/NPOListPage/NPOListPage";

const router = createBrowserRouter([
    {
        element: <Providers />,
        // errorElement: <ErrorPage />,
        children: [
            {
                element: <RootLayout />,
                children: [
                    {
                        index: true,
                        element: <HomePage />,
                    },
                    {
                        path: "map",
                        element: <MapPage />,
                    },
                    {
                        path: "npo",
                        element: <NPOListPage />,
                    },
                    {
                        path: "login",
                        element: (
                            <AuthRoute>
                                <LoginPage />
                            </AuthRoute>
                        ),
                    },
                    {
                        path: "reg",
                        element: (
                            <AuthRoute>
                                <RegistrationPage />
                            </AuthRoute>
                        ),
                    },
                    {
                        path: "profile",
                        element: (
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);

export default router;
