export const getApiBaseUrl = (): string => {
    // Vite автоматически устанавливает import.meta.env.DEV и import.meta.env.PROD
    // DEV === true когда запущен через npm run dev
    // PROD === true когда собран для production (npm run build, в том числе в Docker)
    
    // Если запущен через npm run dev, используем VITE_API_DEV_BASE_URL
    if (import.meta.env.DEV === true) {
        const devUrl = import.meta.env.VITE_API_DEV_BASE_URL || "http://localhost:8000";
        // console.log("[API URL] DEV MODE - Using:", devUrl);
        return devUrl;
    }
    
    // Если собран для production (запущен из Docker), используем VITE_API_PROD_BASE_URL
    if (import.meta.env.PROD === true) {
        // Определяем протокол текущей страницы
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        
        let prodUrl = import.meta.env.VITE_API_PROD_BASE_URL || "https://it-hackathon-team06.mephi.ru/api";
        // Если страница загружена по HTTPS, принудительно используем HTTPS для API
        if (isHttps && prodUrl.startsWith("http://")) {
            prodUrl = prodUrl.replace("http://", "https://");
        }
        // console.log("[API URL] PROD MODE - Using:", prodUrl);
        return prodUrl;
    }
    
    // Fallback: по умолчанию используем dev URL для безопасности
    const devUrl = import.meta.env.VITE_API_DEV_BASE_URL || "http://localhost:8000";
    // console.error("[API URL] FALLBACK - Using:", devUrl);
    return devUrl;
};
