export const getApiBaseUrl = (): string => {
    const isProduction = import.meta.env.VITE_IS_PRODUCTION === "true";

    if (isProduction) {
        return import.meta.env.VITE_API_PROD_BASE_URL || "https://it-hackathon-team06.mephi.ru/api";
    } else {
        return import.meta.env.VITE_API_DEV_BASE_URL || "http://localhost:8000";
    }
};
