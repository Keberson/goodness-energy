import type { NewsEditorElement } from "@app-types/news-editor.types";

export const convertElementsToNewsData = (elements: NewsEditorElement[]) => {
    const htmlParts: string[] = [];
    const attachedIds: number[] = [];

    elements.forEach((element) => {
        switch (element.type) {
            case "heading": {
                const level = (element.props?.level as number) || 2;
                const content = (element.content as string) || "";
                htmlParts.push(`<h${level}>${escapeHtml(content)}</h${level}>`);
                break;
            }

            case "paragraph": {
                const content = (element.content as string) || "";
                htmlParts.push(content);
                break;
            }

            case "image": {
                // Получаем ID изображений, фильтруя невалидные значения
                let imageIds: number[] = [];
                
                if (Array.isArray(element.content)) {
                    imageIds = element.content
                        .map((id) => {
                            if (typeof id === "number") return id;
                            const parsed = parseInt(String(id), 10);
                            return isNaN(parsed) ? 0 : parsed;
                        })
                        .filter((id) => id > 0);
                } else if (typeof element.content === "number" && element.content > 0) {
                    imageIds = [element.content];
                }

                // Создаем HTML только для валидных изображений
                if (imageIds.length > 0) {
                    imageIds.forEach((fileId) => {
                        if (fileId <= 0 || isNaN(fileId)) {
                            console.warn("Пропущен невалидный fileId:", fileId);
                            return;
                        }
                        
                        attachedIds.push(fileId);
                        const caption = (element.props?.caption as string) || "";
                        const captionHtml = caption
                            ? `<p class="image-caption">${escapeHtml(caption)}</p>`
                            : "";
                        htmlParts.push(
                            `<div class="news-image" data-file-id="${fileId}">${captionHtml}</div>`
                        );
                    });
                }
                break;
            }

            case "list": {
                const items = Array.isArray(element.content)
                    ? element.content
                    : [element.content as string];
                const listItems = items
                    .map((item) => `<li>${escapeHtml(String(item))}</li>`)
                    .join("");
                htmlParts.push(`<ul>${listItems}</ul>`);
                break;
            }

            case "quote": {
                const content = (element.content as string) || "";
                htmlParts.push(`<blockquote>${escapeHtml(content)}</blockquote>`);
                break;
            }

            case "link": {
                const url = (element.props?.url as string) || "";
                const text = (element.content as string) || "";
                if (url) {
                    htmlParts.push(
                        `<a href="${escapeHtml(
                            url
                        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                            text || url
                        )}</a>`
                    );
                } else {
                    htmlParts.push(`<span>${escapeHtml(text || "Ссылка не настроена")}</span>`);
                }
                break;
            }

            case "file": {
                const fileId =
                    typeof element.content === "number"
                        ? element.content
                        : parseInt(String(element.content));
                if (fileId && fileId > 0) {
                    attachedIds.push(fileId);
                    htmlParts.push(`<div class="news-file" data-file-id="${fileId}"></div>`);
                }
                break;
            }

            case "divider": {
                htmlParts.push("<hr>");
                break;
            }
        }
    });

    return {
        html: htmlParts.join(""),
        attachedIds: [...new Set(attachedIds)],
    };
};

const escapeHtml = (text: string): string => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Конвертирует HTML обратно в элементы редактора новостей
 */
export const convertNewsDataToElements = (html: string): NewsEditorElement[] => {
    const elements: NewsEditorElement[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;

    // Вспомогательная функция для создания уникального ID
    const generateId = () => `element-${Date.now()}-${Math.random()}`;

    // Вспомогательная функция для извлечения текста из элемента
    const getTextContent = (element: Element | null): string => {
        if (!element) return "";
        return element.textContent || "";
    };

    // Обрабатываем все дочерние элементы body
    const processNode = (node: Node): void => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();

            switch (tagName) {
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6": {
                    const level = parseInt(tagName.substring(1), 10);
                    const content = getTextContent(element);
                    if (content.trim()) {
                        elements.push({
                            id: generateId(),
                            type: "heading",
                            content: content.trim(),
                            props: { level },
                        });
                    }
                    break;
                }

                case "div": {
                    // Проверяем на изображение или файл
                    const fileId = element.getAttribute("data-file-id");
                    if (fileId) {
                        const fileIdNum = parseInt(fileId, 10);
                        if (!isNaN(fileIdNum) && fileIdNum > 0) {
                            if (element.classList.contains("news-image")) {
                                // Извлекаем подпись к изображению
                                const captionEl = element.querySelector(".image-caption");
                                const caption = captionEl ? getTextContent(captionEl) : "";
                                elements.push({
                                    id: generateId(),
                                    type: "image",
                                    content: fileIdNum,
                                    props: caption ? { caption } : undefined,
                                });
                            } else if (element.classList.contains("news-file")) {
                                elements.push({
                                    id: generateId(),
                                    type: "file",
                                    content: fileIdNum,
                                });
                            }
                        }
                    } else {
                        // Обычный div - конвертируем в параграф
                        const content = getTextContent(element);
                        if (content.trim()) {
                            elements.push({
                                id: generateId(),
                                type: "paragraph",
                                content: content.trim(),
                            });
                        }
                    }
                    break;
                }

                case "p": {
                    // Пропускаем подписи к изображениям (они уже обработаны)
                    if (element.classList.contains("image-caption")) {
                        break;
                    }
                    const content = getTextContent(element);
                    if (content.trim()) {
                        elements.push({
                            id: generateId(),
                            type: "paragraph",
                            content: content.trim(),
                        });
                    }
                    break;
                }

                case "ul":
                case "ol": {
                    const items: string[] = [];
                    const listItems = element.querySelectorAll("li");
                    listItems.forEach((li) => {
                        const text = getTextContent(li);
                        if (text.trim()) {
                            items.push(text.trim());
                        }
                    });
                    if (items.length > 0) {
                        elements.push({
                            id: generateId(),
                            type: "list",
                            content: items,
                        });
                    }
                    break;
                }

                case "blockquote": {
                    const content = getTextContent(element);
                    if (content.trim()) {
                        elements.push({
                            id: generateId(),
                            type: "quote",
                            content: content.trim(),
                        });
                    }
                    break;
                }

                case "a": {
                    const url = element.getAttribute("href") || "";
                    const text = getTextContent(element);
                    if (url || text.trim()) {
                        elements.push({
                            id: generateId(),
                            type: "link",
                            content: text.trim() || url,
                            props: { url },
                        });
                    }
                    break;
                }

                case "hr": {
                    elements.push({
                        id: generateId(),
                        type: "divider",
                        content: "",
                    });
                    break;
                }

                default: {
                    // Для других элементов пытаемся извлечь текст
                    const content = getTextContent(element);
                    if (content.trim() && !element.querySelector("h1, h2, h3, h4, h5, h6, ul, ol, blockquote, a, hr")) {
                        // Если внутри нет других структурных элементов, создаем параграф
                        elements.push({
                            id: generateId(),
                            type: "paragraph",
                            content: content.trim(),
                        });
                    } else {
                        // Рекурсивно обрабатываем дочерние элементы
                        Array.from(element.childNodes).forEach(processNode);
                    }
                    break;
                }
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            // Обрабатываем текстовые узлы, которые не являются частью элементов
            const text = node.textContent?.trim();
            if (text) {
                elements.push({
                    id: generateId(),
                    type: "paragraph",
                    content: text,
                });
            }
        }
    };

    // Обрабатываем все узлы в body
    Array.from(body.childNodes).forEach(processNode);

    return elements;
};