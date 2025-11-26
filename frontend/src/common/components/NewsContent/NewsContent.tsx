import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { Provider } from "react-redux";
import FilePreview from "@components/FilePreview/FilePreview";
import { store } from "@services/store.service";

interface NewsContentProps {
    html: string;
    className?: string;
    style?: React.CSSProperties;
}

const NewsContent = ({ html, className, style }: NewsContentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rootsRef = useRef<Root[]>([]);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        if (!containerRef.current) return;

        // Очищаем предыдущие root'ы асинхронно
        const currentRoots = [...rootsRef.current];
        rootsRef.current = [];
        setTimeout(() => {
            currentRoots.forEach((root) => {
                try {
                    root.unmount();
                } catch (e) {
                    // Игнорируем ошибки при размонтировании
                }
            });
        }, 0);

        // Ждем, пока HTML будет установлен в DOM
        const processElements = () => {
            if (!containerRef.current || !isMountedRef.current) return;

            // Удаляем пустые элементы с классом news-image или news-file, но без data-file-id
            const emptyImageElements = containerRef.current.querySelectorAll(
                ".news-image:not([data-file-id]), .news-file:not([data-file-id])"
            );
            emptyImageElements.forEach((el) => {
                el.remove();
            });

            // Находим все элементы с data-file-id
            const fileElements = containerRef.current.querySelectorAll("[data-file-id]");

            if (fileElements.length === 0) {
                // Если элементов нет, возможно HTML еще не установлен, попробуем еще раз
                return;
            }

            fileElements.forEach((element) => {
                const fileId = element.getAttribute("data-file-id");
                if (!fileId) return;

                const fileIdNum = parseInt(fileId, 10);
                if (isNaN(fileIdNum) || fileIdNum <= 0) {
                    console.warn("Невалидный fileId:", fileId);
                    return;
                }

                // Проверяем, не обработан ли уже этот элемент
                if (element.hasAttribute("data-processed")) {
                    return;
                }
                element.setAttribute("data-processed", "true");

                // Сохраняем содержимое элемента (например, подпись к изображению)
                const existingContent = element.innerHTML;
                const elementClass = element.className || "";

                // Создаем контейнер для React компонента с сохранением классов
                const reactContainer = document.createElement("div");
                reactContainer.className = elementClass;
                reactContainer.style.display = "flex";
                reactContainer.style.flexDirection = "column";
                reactContainer.style.alignItems = "center";
                reactContainer.style.width = "100%";

                // Заменяем оригинальный элемент
                element.replaceWith(reactContainer);

                // Рендерим FilePreview в контейнер с Provider
                try {
                    const root = createRoot(reactContainer);
                    root.render(
                        <Provider store={store}>
                            <FilePreview fileId={fileIdNum} hideFileName={true} />
                            {existingContent && existingContent.trim() && (
                                <div
                                    className="image-caption-wrapper"
                                    dangerouslySetInnerHTML={{ __html: existingContent }}
                                />
                            )}
                        </Provider>
                    );
                    rootsRef.current.push(root);
                } catch (e) {
                    console.error("Ошибка при рендеринге FilePreview:", e);
                }
            });
        };

        // Используем requestAnimationFrame для ожидания рендеринга HTML
        const rafId = requestAnimationFrame(() => {
            // Дополнительная задержка для гарантии, что HTML установлен
            setTimeout(processElements, 10);
        });

        // Cleanup функция
        return () => {
            isMountedRef.current = false;
            cancelAnimationFrame(rafId);
            // Асинхронно размонтируем roots, чтобы избежать конфликта с рендерингом
            const rootsToUnmount = [...rootsRef.current];
            rootsRef.current = [];
            setTimeout(() => {
                rootsToUnmount.forEach((root) => {
                    try {
                        root.unmount();
                    } catch (e) {
                        // Игнорируем ошибки
                    }
                });
            }, 0);
        };
    }, [html]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={style}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default NewsContent;

