export const getApiBaseUrl = (): string => {
    // Vite автоматически устанавливает import.meta.env.DEV и import.meta.env.PROD
    // DEV === true когда запущен через npm run dev
    // PROD === true когда собран для production (npm run build)
    
    // Определяем hostname и port для проверки
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const port = typeof window !== "undefined" ? window.location.port : "";
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
    // Проверяем, что это dev-сервер Vite (обычно работает на порту 5173)
    const isViteDevServer = port === "5173" || port === "3000" || port === "5174" || port === "";
    
    // КРИТИЧЕСКИ ВАЖНО: Если import.meta.env.DEV === true, ВСЕГДА используем localhost
    // Это означает, что приложение запущено через npm run dev
    // ИГНОРИРУЕМ VITE_API_DEV_BASE_URL если она указывает на прод
    if (import.meta.env.DEV === true) {
        // В dev режиме ВСЕГДА используем localhost, игнорируя переменные окружения
        const devUrl = "http://localhost:8000";
        console.warn("[API URL] DEV MODE DETECTED - Force using localhost:", devUrl, {
            "import.meta.env.DEV": import.meta.env.DEV,
            "import.meta.env.PROD": import.meta.env.PROD,
            "import.meta.env.MODE": import.meta.env.MODE,
            "VITE_API_DEV_BASE_URL": import.meta.env.VITE_API_DEV_BASE_URL,
            hostname,
            port,
        });
        return devUrl;
    }
    
    // Если на localhost или Vite dev server порт, используем localhost backend
    // ИГНОРИРУЕМ переменные окружения, которые могут указывать на прод
    if (isLocalhost || isViteDevServer) {
        // В dev режиме ВСЕГДА используем localhost
        const devUrl = "http://localhost:8000";
        console.warn("[API URL] LOCALHOST DETECTED - Force using localhost:", devUrl, {
            "import.meta.env.DEV": import.meta.env.DEV,
            "import.meta.env.PROD": import.meta.env.PROD,
            "import.meta.env.MODE": import.meta.env.MODE,
            "VITE_API_DEV_BASE_URL": import.meta.env.VITE_API_DEV_BASE_URL,
            hostname,
            port,
            isLocalhost,
            isViteDevServer,
        });
        return devUrl;
    }
    
    // Если собран для production (запущен из контейнера), используем продовый URL
    if (import.meta.env.PROD === true) {
        // Определяем протокол текущей страницы
        const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
        
        let prodUrl = import.meta.env.VITE_API_PROD_BASE_URL || "https://it-hackathon-team06.mephi.ru/api";
        // Если страница загружена по HTTPS, принудительно используем HTTPS для API
        if (isHttps && prodUrl.startsWith("http://")) {
            prodUrl = prodUrl.replace("http://", "https://");
        }
        console.log("[API URL] PROD MODE - Using:", prodUrl, {
            "import.meta.env.DEV": import.meta.env.DEV,
            "import.meta.env.PROD": import.meta.env.PROD,
            "import.meta.env.MODE": import.meta.env.MODE,
            hostname,
            port,
            isHttps,
        });
        return prodUrl;
    }
    
    // Fallback: по умолчанию используем localhost для безопасности
    const devUrl = import.meta.env.VITE_API_DEV_BASE_URL || "http://localhost:8000";
    console.error("[API URL] FALLBACK - Using:", devUrl, {
        "import.meta.env.DEV": import.meta.env.DEV,
        "import.meta.env.PROD": import.meta.env.PROD,
        "import.meta.env.MODE": import.meta.env.MODE,
        hostname,
        port,
    });
    return devUrl;
};
