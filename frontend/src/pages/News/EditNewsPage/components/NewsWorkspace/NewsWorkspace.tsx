import { Card, Typography } from "antd";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { NewsEditorElement } from "@app-types/news-editor.types";
import ElementRenderer from "./ElementRenderer";

const { Text } = Typography;

interface NewsWorkspaceProps {
    elements: NewsEditorElement[];
    onUpdateElement: (
        id: string,
        content: string | string[] | number | number[],
        props?: Record<string, any>
    ) => void;
    onDeleteElement: (id: string) => void;
    activeId: string | null;
}

const NewsWorkspace = ({ elements, onUpdateElement, onDeleteElement, activeId }: NewsWorkspaceProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: "workspace",
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                padding: 24,
                minHeight: "calc(100vh - 48px)",
                backgroundColor: isOver ? "#f0f7ff" : "transparent",
                transition: "background-color 0.2s",
                border: "2px dashed #d9d9d9",
                borderRadius: 8,
                margin: "16px 0",
            }}
        >
            {elements.length === 0 ? (
                <Card>
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                        <Text type="secondary">Перетащите элементы сюда для создания новости</Text>
                    </div>
                </Card>
            ) : (
                <SortableContext
                    items={elements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {elements.map((element) => (
                        <ElementRenderer
                            key={element.id}
                            element={element}
                            onUpdate={(content, props) =>
                                onUpdateElement(element.id, content, props)
                            }
                            onDelete={() => onDeleteElement(element.id)}
                            activeId={activeId}
                        />
                    ))}
                </SortableContext>
            )}
        </div>
    );
};

export default NewsWorkspace;
