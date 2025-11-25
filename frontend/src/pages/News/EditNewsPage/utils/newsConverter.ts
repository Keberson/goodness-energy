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
