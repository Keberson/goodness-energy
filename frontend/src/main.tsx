import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import dayjs from "dayjs";

import "@ant-design/v5-patch-for-react-19";

import "./styles/main.scss";

import router from "./router";

// Инициализация версии для слабовидящих при загрузке страницы
const savedAccessibilityMode = localStorage.getItem("accessibilityMode");
if (savedAccessibilityMode === "true") {
    document.body.classList.add("accessibility-mode");
}

dayjs.locale("ru");
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
