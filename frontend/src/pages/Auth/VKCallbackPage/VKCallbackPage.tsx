import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Typography } from "antd";
import useAppDispatch from "@hooks/useAppDispatch";
import { login } from "@services/slices/auth.slice";

const { Title } = Typography;

const VKCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get("token");
        const userType = searchParams.get("user_type");
        const userId = searchParams.get("id");

        if (token && userType && userId) {
            // Сохраняем данные авторизации
            dispatch(
                login({
                    token,
                    type: userType as "volunteer" | "npo" | "admin",
                    id: parseInt(userId, 10),
                })
            );

            // Перенаправляем на главную страницу
            setTimeout(() => {
                navigate("/");
            }, 500);
        } else {
            // Если нет токена, перенаправляем на страницу входа
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    }, [searchParams, dispatch, navigate]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                gap: 16,
            }}
        >
            <Spin size="large" />
            <Title level={4}>Обработка авторизации VK...</Title>
        </div>
    );
};

export default VKCallbackPage;
