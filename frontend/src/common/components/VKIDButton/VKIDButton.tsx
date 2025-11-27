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

                        // Получаем данные пользователя через VK API на фронтенде
                        // Это необходимо, так как access_token привязан к IP клиента и не работает на сервере
                        console.log(
                            "VK ID: получаем данные пользователя через VK API на фронтенде..."
                        );
                        let userData = null;
                        try {
                            const userInfoResponse = await fetch(
                                `https://api.vk.com/method/users.get?access_token=${vkTokens.access_token}&v=5.131&fields=email,bdate,sex,city,contacts`
                            );
                            const userInfoData = await userInfoResponse.json();
                            console.log("VK ID: получены данные пользователя", userInfoData);

                            if (!userInfoData.error && userInfoData.response?.[0]) {
                                const userInfo = userInfoData.response[0];
                                const cityInfo = userInfo.city;
                                userData = {
                                    id: userInfo.id,
                                    first_name: userInfo.first_name,
                                    last_name: userInfo.last_name,
                                    email: userInfo.email,
                                    bdate: userInfo.bdate,
                                    sex: userInfo.sex,
                                    city: cityInfo?.title || null,
                                    phone: userInfo.mobile_phone || userInfo.phone || null,
                                };
                                console.log("VK ID: обработанные данные пользователя", userData);
                            } else {
                                console.warn(
                                    "VK ID: не удалось получить данные пользователя через API",
                                    userInfoData
                                );
                            }
                        } catch (error) {
                            console.error(
                                "VK ID: ошибка при получении данных пользователя (CORS или другая)",
                                error
                            );
                            // Продолжаем без данных пользователя, бэкенд попробует получить их сам
                        }

                        // Отправляем токены и данные пользователя на бэкенд
                        console.log("VK ID: отправляем токены и данные пользователя на бэкенд...");
                        const response = await vkIdAuth({
                            access_token: vkTokens.access_token,
                            id_token: vkTokens.id_token,
                            user_data: userData,
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
                            if (response.vk_data.bdate) {
                                params.append("bdate", response.vk_data.bdate);
                            }
                            if (response.vk_data.sex !== undefined) {
                                params.append("sex", String(response.vk_data.sex));
                            }
                            if (response.vk_data.city) {
                                params.append("city", response.vk_data.city);
                            }
                            if (response.vk_data.phone) {
                                params.append("phone", response.vk_data.phone);
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
