import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppDispatch from "@hooks/useAppDispatch";
import { login } from "@services/slices/auth.slice";
import { useVkIdAuthMutation } from "@services/api/auth.api";

declare global {
    interface Window {
        VKIDSDK: any;
    }
}

// Загрузка VK ID SDK
const loadVKIDSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (window.VKIDSDK) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        // Используем VK ID SDK через CDN (загружается динамически)
        // Версия будет автоматически последняя стабильная
        script.src = "https://unpkg.com/@vkid/sdk/dist-sdk/umd/index.js";
        script.async = true;
        script.onload = () => {
            if (window.VKIDSDK) {
                resolve();
            } else {
                reject(new Error("VK ID SDK не загружен"));
            }
        };
        script.onerror = () => reject(new Error("Ошибка загрузки VK ID SDK"));
        document.head.appendChild(script);
    });
};

interface VKIDButtonProps {
    appId: number;
    redirectUrl: string;
    onError?: (error: any) => void;
}

const VKIDButton = ({ appId, redirectUrl, onError }: VKIDButtonProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [vkIdAuth] = useVkIdAuthMutation();
    const [sdkLoaded, setSdkLoaded] = useState(false);

    // Загружаем VK ID SDK
    useEffect(() => {
        loadVKIDSDK()
            .then(() => {
                setSdkLoaded(true);
            })
            .catch((error) => {
                console.error("Ошибка загрузки VK ID SDK:", error);
                if (onError) {
                    onError(error);
                }
            });
    }, [onError]);

    // Инициализируем VK ID после загрузки SDK
    useEffect(() => {
        if (!sdkLoaded || !window.VKIDSDK || !containerRef.current) {
            return;
        }

        const VKID = window.VKIDSDK;

        try {
            // Инициализация VK ID SDK
            VKID.Config.init({
                app: appId,
                redirectUrl: redirectUrl,
                responseMode: VKID.ConfigResponseMode.Callback,
                source: VKID.ConfigSource.LOWCODE,
                scope: "", // Можно добавить нужные права при необходимости
            });

            // Создание OneTap виджета
            const oneTap = new VKID.OneTap();

            oneTap
                .render({
                    container: containerRef.current,
                    showAlternativeLogin: true,
                })
                .on(VKID.WidgetEvents.ERROR, (error: any) => {
                    console.error("VK ID Error:", error);
                    if (onError) {
                        onError(error);
                    }
                })
                .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload: any) => {
                    const code = payload.code;
                    const deviceId = payload.device_id;

                    try {
                        // Обмениваем код на токен через VK ID SDK на фронтенде
                        // Это необходимо, так как SDK использует PKCE и code_verifier доступен только на клиенте
                        console.log("VK ID: обмениваем код на токен через SDK...");
                        const vkTokens = await VKID.Auth.exchangeCode(code, deviceId);
                        console.log("VK ID: получены токены от SDK", {
                            has_access_token: !!vkTokens.access_token,
                            has_id_token: !!vkTokens.id_token,
                        });

                        // Отправляем access_token и id_token на бэкенд
                        // Бэкенд попытается получить данные из id_token (JWT), что не требует запросов к VK API
                        // Если это не сработает, бэкенд сделает запрос к VK API
                        console.log("VK ID: отправляем токены на бэкенд для получения данных пользователя...");
                        const response = await vkIdAuth({
                            access_token: vkTokens.access_token,
                            id_token: vkTokens.id_token,
                        }).unwrap();
                        console.log("VK ID: получен ответ от бэкенда", {
                            user_exists: response.user_exists,
                        });

                        if (response.user_exists && response.token) {
                            // Пользователь существует - авторизуем
                            dispatch(
                                login({
                                    token: response.token.access_token,
                                    type: response.token.user_type,
                                    id: response.token.id,
                                })
                            );
                            navigate("/");
                        } else if (response.vk_id && response.vk_data) {
                            // Пользователя нет - редиректим на регистрацию с данными VK
                            const params = new URLSearchParams({
                                vk_id: String(response.vk_id),
                                first_name: response.vk_data.first_name || "",
                                last_name: response.vk_data.last_name || "",
                            });
                            if (response.vk_data.email) {
                                params.append("email", response.vk_data.email);
                            }
                            navigate(`/reg?${params.toString()}`);
                        } else {
                            throw new Error("Неожиданный формат ответа от сервера");
                        }
                    } catch (error: any) {
                        console.error("VK ID Auth Error:", error);
                        if (onError) {
                            onError(error);
                        }
                    }
                });
        } catch (error) {
            console.error("VK ID SDK initialization error:", error);
            if (onError) {
                onError(error);
            }
        }

        // Cleanup
        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [sdkLoaded, appId, redirectUrl, navigate, dispatch, vkIdAuth, onError]);

    return <div ref={containerRef} />;
};

export default VKIDButton;
