import { createBrowserRouter } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";

import AuthRoute from "@components/routes/AuthRoute/AuthRoute";
import ProtectedRoute from "@components/routes/ProtectedRoute/ProtectedRoute";
import NPOProtectedRoute from "@components/routes/NPOProtectedRoute/NPOProtectedRoute";
import AdminProtectedRoute from "@components/routes/AdminProtectedRoute/AdminProtectedRoute";

import RootLayout from "./common/RootLayout/RootLayout";
import Providers from "./common/Providers/Providers";

import LoginPage from "./pages/Auth/LoginPage/LoginPage";
import RegistrationPage from "./pages/Auth/RegistrationPage/RegistrationPage";
import ProfilePage from "./pages/Volunteer/ProfilePage/ProfilePage";
import NPOProfilePage from "./pages/NPO/NPOProfilePage/NPOProfilePage";
import ManageEventsPage from "./pages/NPO/ManageEventsPage/ManageEventsPage";
import StatisticsPage from "./pages/NPO/StatisticsPage/StatisticsPage";
import MapPage from "./pages/MapPage/MapPage";
import NPOListPage from "./pages/NPO/NPOListPage/NPOListPage";
import NPOPage from "./pages/NPO/NPOPage/NPOPage";
import NewsListPage from "./pages/News/NewsListPage/NewsListPage";
import NewsPage from "./pages/News/NewsPage/NewsPage";
import KnowledgesPage from "./pages/Knowledges/KnowledgesPage/KnowledgesPage";
import KnowledgeDetailPage from "./pages/Knowledges/KnowledgesDetailPage/KnowledgesDetailPage";
import EventsPage from "./pages/Events/EventsPage/EventsPage";
import CreateKnowledgePage from "./pages/Admin/CreateKnowledgePage/CreateKnowledgePage";
import ModerationPage from "./pages/Admin/ModerationPage/ModerationPage";

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
                        children: [
                            {
                                index: true,
                                element: <NPOListPage />,
                            },
                            {
                                path: ":id",
                                element: <NPOPage />,
                            },
                        ],
                    },
                    {
                        path: "news",
                        children: [
                            {
                                index: true,
                                element: <NewsListPage />,
                            },
                            {
                                path: ":id",
                                element: <NewsPage />,
                            },
                        ],
                    },
                    {
                        path: "knowledges",
                        children: [
                            {
                                index: true,
                                element: <KnowledgesPage />,
                            },
                            {
                                path: ":id",
                                element: <KnowledgeDetailPage />,
                            },
                        ],
                    },
                    {
                        path: "events",
                        element: <EventsPage />,
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
                    {
                        path: "org",
                        element: (
                            <NPOProtectedRoute>
                                <NPOProfilePage />
                            </NPOProtectedRoute>
                        ),
                    },
                    {
                        path: "manage-events",
                        element: (
                            <NPOProtectedRoute>
                                <ManageEventsPage />
                            </NPOProtectedRoute>
                        ),
                    },
                    {
                        path: "statistics",
                        element: (
                            <NPOProtectedRoute>
                                <StatisticsPage />
                            </NPOProtectedRoute>
                        ),
                    },
                    {
                        path: "create-knowledge",
                        element: (
                            <AdminProtectedRoute>
                                <CreateKnowledgePage />
                            </AdminProtectedRoute>
                        ),
                    },
                    {
                        path: "moderation",
                        element: (
                            <AdminProtectedRoute>
                                <ModerationPage />
                            </AdminProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);

export default router;
