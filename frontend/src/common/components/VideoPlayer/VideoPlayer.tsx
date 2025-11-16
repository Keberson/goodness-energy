import React from "react";
import { Typography, Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface VideoPlayerProps {
    videoUrl: string;
    title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title }) => {
    const isRutubeVideo = videoUrl.includes("rutube.ru");
    const isVKVideo = videoUrl.includes("vk.com") || videoUrl.includes("vkvideo.ru");

    if (isRutubeVideo) {
        const getRutubeId = (url: string) => {
            const match = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
            return match ? match[1] : null;
        };

        const videoId = getRutubeId(videoUrl);

        if (videoId) {
            return (
                <div style={{ textAlign: "center" }}>
                    <iframe
                        width="100%"
                        height="400"
                        src={`https://rutube.ru/play/embed/${videoId}`}
                        title={title}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        style={{
                            borderRadius: 8,
                            maxWidth: 800,
                            backgroundColor: "#000",
                        }}
                    />
                    {title && (
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">{title}</Text>
                        </div>
                    )}
                </div>
            );
        }
    }

    if (isVKVideo) {
        return (
            <div style={{ textAlign: "center", padding: 20 }}>
                <div
                    style={{
                        width: "100%",
                        maxWidth: 800,
                        height: 200,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 8,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto",
                    }}
                >
                    <Text strong style={{ marginBottom: 16 }}>
                        Видео доступно только на VK
                    </Text>
                    <Button
                        type="primary"
                        icon={<LinkOutlined />}
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Перейти к просмотру на VK
                    </Button>
                </div>
                {title && (
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary">{title}</Text>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ textAlign: "center" }}>
            <video
                controls
                style={{
                    width: "100%",
                    maxWidth: 800,
                    height: "auto",
                    borderRadius: 8,
                    backgroundColor: "#000",
                }}
                src={videoUrl}
                title={title}
            >
                Ваш браузер не поддерживает видео.
            </video>
            {title && (
                <div style={{ marginTop: 8 }}>
                    <Text type="secondary">{title}</Text>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
