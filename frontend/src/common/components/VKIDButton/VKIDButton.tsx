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
                scope: "vkid.personal_info email phone",
            });

            // Создание OneTap виджета
            const oneTap = new VKID.OneTap();

            oneTap
                .render({
                    container: containerRef.current,
                    showAlternativeLogin: true,
                })
                .on(VKID.WidgetEvents.ERROR, (error: any) => {
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
                        const vkTokens = await VKID.Auth.exchangeCode(code, deviceId);

                        // Отправляем токены на бэкенд для получения vk_id
                        const response = await vkIdAuth({
                            access_token: vkTokens.access_token,
                            id_token: vkTokens.id_token,
                        }).unwrap();

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
                        } else if (response.vk_id) {
                            // Пользователя нет - редиректим на регистрацию с vk_id
                            // Пользователь сам заполнит все данные
                            navigate(`/reg?vk_id=${response.vk_id}`);
                        } else {
                            throw new Error("Неожиданный формат ответа от сервера");
                        }
                    } catch (error: any) {
                        if (onError) {
                            onError(error);
                        }
                    }
                });
        } catch (error) {
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
