import type { NewsStatus } from "@app-types/news.types";

export const getNewsStatusLabel = (status: NewsStatus): string => {
    const labels: Record<NewsStatus, string> = {
        published: "Опубликовано",
        rejected: "Отклонено",
        pending: "На проверке",
    };
    return labels[status] || status;
};

export const getNewsStatusColor = (status: NewsStatus): string => {
    const colors: Record<NewsStatus, string> = {
        published: "green",
        rejected: "red",
        pending: "orange",
    };
    return colors[status] || "default";
};

