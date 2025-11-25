export const getApiBaseUrl = (): string => {
    const isProduction = import.meta.env.VITE_IS_PRODUCTION === "true";
    
    // Определяем протокол текущей страницы
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    
    // Определяем, находимся ли мы на production домене
    const isProductionDomain = typeof window !== "undefined" && 
        window.location.hostname === "it-hackathon-team06.mephi.ru";

    if (isProduction || isProductionDomain) {
        let prodUrl = import.meta.env.VITE_API_PROD_BASE_URL || "https://it-hackathon-team06.mephi.ru/api";
        // Если страница загружена по HTTPS, принудительно используем HTTPS для API
        if (isHttps && prodUrl.startsWith("http://")) {
            prodUrl = prodUrl.replace("http://", "https://");
        }
        return prodUrl;
    } else {
        // В development режиме
        const devUrl = import.meta.env.VITE_API_DEV_BASE_URL || "http://localhost:8000";
        // Если страница HTTPS и не localhost, используем HTTPS
        if (isHttps && !devUrl.includes("localhost") && devUrl.startsWith("http://")) {
            return devUrl.replace("http://", "https://");
        }
        return devUrl;
    }
};
