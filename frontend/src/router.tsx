import { createBrowserRouter } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";

import RootLayout from "./common/RootLayout/RootLayout";
import Providers from "./common/Providers/Providers";

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
                ],
            },
        ],
    },
]);

export default router;
