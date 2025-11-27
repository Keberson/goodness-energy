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
import VKCallbackPage from "./pages/Auth/VKCallbackPage/VKCallbackPage";
import ProfilePage from "./pages/Volunteer/ProfilePage/ProfilePage";
import MyEventsPage from "./pages/Volunteer/MyEventsPage/MyEventsPage";
import FavoritesPage from "./pages/Volunteer/FavoritesPage/FavoritesPage";
import MyNewsPage from "./pages/News/MyNewsPage/MyNewsPage";
import NPOProfilePage from "./pages/NPO/NPOProfilePage/NPOProfilePage";
import ManageEventsPage from "./pages/NPO/ManageEventsPage/ManageEventsPage";
import StatisticsPage from "./pages/NPO/StatisticsPage/StatisticsPage";
import MapPage from "./pages/MapPage/MapPage";
import NPOListPage from "./pages/NPO/NPOListPage/NPOListPage";
import NPOPage from "./pages/NPO/NPOPage/NPOPage";
import NewsListPage from "./pages/News/NewsListPage/NewsListPage";
import NewsPage from "./pages/News/NewsPage/NewsPage";
import EditNewsPage from "./pages/News/EditNewsPage/EditNewsPage";
import KnowledgesPage from "./pages/Knowledges/KnowledgesPage/KnowledgesPage";
import KnowledgeDetailPage from "./pages/Knowledges/KnowledgesDetailPage/KnowledgesDetailPage";
import EventsPage from "./pages/Events/EventsPage/EventsPage";
import CreateKnowledgePage from "./pages/Admin/CreateKnowledgePage/CreateKnowledgePage";
import ModerationPage from "./pages/Admin/ModerationPage/ModerationPage";
import AdminStatisticsPage from "./pages/Admin/AdminStatisticsPage/AdminStatisticsPage";

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
                        path: "volunteer-posts",
                        children: [
                            {
                                index: true,
                                element: <NewsListPage section="posts" />,
                            },
                            {
                                path: "edit/:id?",
                                element: (
                                    <ProtectedRoute>
                                        <EditNewsPage />
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: ":id",
                                element: <NewsPage />,
                            },
                        ],
                    },
                    {
                        path: "news",
                        children: [
                            {
                                index: true,
                                element: <NewsListPage section="news" />,
                            },
                            {
                                path: "edit/:id?",
                                element: (
                                    <ProtectedRoute>
                                        <EditNewsPage />
                                    </ProtectedRoute>
                                ),
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
                                path: "create",
                                element: (
                                    <AdminProtectedRoute>
                                        <CreateKnowledgePage />
                                    </AdminProtectedRoute>
                                ),
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
                        path: "auth/vk/success",
                        element: <VKCallbackPage />,
                    },
                    {
                        path: "auth/vk/callback",
                        element: <VKCallbackPage />,
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
                        path: "my-events",
                        element: (
                            <ProtectedRoute>
                                <MyEventsPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "favorites",
                        element: (
                            <ProtectedRoute>
                                <FavoritesPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "my-news",
                        element: (
                            <ProtectedRoute>
                                <MyNewsPage />
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
                        path: "moderation",
                        element: (
                            <AdminProtectedRoute>
                                <ModerationPage />
                            </AdminProtectedRoute>
                        ),
                    },
                    {
                        path: "admin-statistics",
                        element: (
                            <AdminProtectedRoute>
                                <AdminStatisticsPage />
                            </AdminProtectedRoute>
                        ),
                    },
                ],
            },
        ],
    },
]);

export default router;
