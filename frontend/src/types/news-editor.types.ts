export type NewsEditorElementType = 
    | "heading" 
    | "paragraph" 
    | "image" 
    | "list" 
    | "quote" 
    | "divider"
    | "link"
    | "file";

export interface NewsEditorElement {
    id: string;
    type: NewsEditorElementType;
    content: string | string[] | number | number[]; // string для текста, string[] для списка, number для одного fileId, number[] для массива fileId изображений
    props?: Record<string, any>; // дополнительные свойства (например, уровень заголовка, подпись к изображению)
}

export interface NewsEditorState {
    elements: NewsEditorElement[];
    title: string;
    type: "blog" | "edu" | "docs";
    tags: string[];
}

