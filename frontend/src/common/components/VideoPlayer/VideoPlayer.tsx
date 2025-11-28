import React, { useEffect } from "react";
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

    const parseVkUrl = (url: string) => {
        // returns { oid, id } if found, otherwise null
        try {
            const u = new URL(url);
            const sp = u.searchParams;
            const qOid = sp.get("oid");
            const qId = sp.get("id");
            if (qOid && qId) {
                return { oid: qOid, id: qId };
            }

            // /video-22822305_456241864
            const pathMatch = u.pathname.match(/video(-?\d+)_(\d+)/);
            if (pathMatch) {
                return { oid: pathMatch[1], id: pathMatch[2] };
            }

            // z=video-22822305_456241864%2F...
            const z = sp.get("z");
            if (z) {
                const zMatch = decodeURIComponent(z).match(/video(-?\d+)_(\d+)/);
                if (zMatch) return { oid: zMatch[1], id: zMatch[2] };
            }

            // fallback: search anywhere in url string
            const allMatch = url.match(/video(-?\d+)_(\d+)/);
            if (allMatch) return { oid: allMatch[1], id: allMatch[2] };
        } catch (e) {
            // Not a full URL, fallback to regex
            const qMatch = url.match(/oid=(-?\d+).*id=(\d+)/);
            if (qMatch) return { oid: qMatch[1], id: qMatch[2] };
            const pathMatch = url.match(/video(-?\d+)_(\d+)/);
            if (pathMatch) return { oid: pathMatch[1], id: pathMatch[2] };
        }
        return null;
    };

    // Load VK videoplayer script if the page contains a VK video (non-conditional hook allowed)
    useEffect(() => {
        if (!isVKVideo) return;
        const id = "vk-videoplayer-js";
        if (!document.getElementById(id)) {
            const s = document.createElement("script");
            s.id = id;
            s.src = "https://vk.com/js/api/videoplayer.js";
            s.async = true;
            document.body.appendChild(s);
        }
    }, [isVKVideo]);

    const renderExternalLink = (url: string) => (
        <div style={{ marginTop: 8 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#1890ff" }}>
                <LinkOutlined style={{ marginRight: 6 }} />
                Открыть в источнике
            </a>
        </div>
    );

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
                    {renderExternalLink(videoUrl)}
                </div>
            );
        }
    }

    if (isVKVideo) {
        const vkParams = parseVkUrl(videoUrl);
        if (vkParams) {
            const { oid, id } = vkParams;
            const src = `https://vk.com/video_ext.php?oid=${encodeURIComponent(
                oid
            )}&id=${encodeURIComponent(id)}&hd=2&js_api=1`;
            return (
                <div style={{ textAlign: "center" }}>
                    <iframe
                        width="100%"
                        height={400}
                        src={src}
                        title={title || "VK Video"}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        frameBorder={0}
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
                    {renderExternalLink(videoUrl)}
                </div>
            );
        }
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
                {renderExternalLink(videoUrl)}
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
            {renderExternalLink(videoUrl)}
        </div>
    );
};

export default VideoPlayer;
