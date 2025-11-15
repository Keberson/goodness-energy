import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import dayjs from "dayjs";

import "@ant-design/v5-patch-for-react-19";

import "./styles/main.scss";

import router from "./router";

dayjs.locale("ru");
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
