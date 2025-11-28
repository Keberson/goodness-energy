import { useState, useEffect } from "react";
import { Button, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface ParagraphElementProps {
    content: string;
    isEditing: boolean;
    onSave: (content: string) => void;
    onCancel: () => void;
    onEdit: () => void;
}

const ParagraphElement = ({
    content,
    isEditing,
    onSave,
    onCancel,
    onEdit,
}: ParagraphElementProps) => {
    const [editValue, setEditValue] = useState(content);

    useEffect(() => {
        setEditValue(content);
    }, [content]);

    const handleSave = () => {
        onSave(editValue);
        onCancel();
    };

    const handleCancel = () => {
        setEditValue(content);
        onCancel();
    };

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["link"],
            [{ color: [] }, { background: [] }],
            ["clean"],
        ],
    };

    const quillFormats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "indent",
        "link",
        "color",
        "background",
    ];

    if (isEditing) {
        return (
            <Space direction="vertical" style={{ width: "100%", position: "relative", zIndex: 1 }}>
                <div
                    style={{
                        backgroundColor: "#fff",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <ReactQuill
                        theme="snow"
                        value={editValue}
                        onChange={setEditValue}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Введите текст..."
                    />
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleSave}
                        size="small"
                    >
                        Сохранить
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={handleCancel} size="small">
                        Отмена
                    </Button>
                </Space>
            </Space>
        );
    }

    return (
        <div
            className="paragraph-element"
            dangerouslySetInnerHTML={{ __html: content === '' ? 'Введите текст...' : content }}
            style={{ lineHeight: "1.6", cursor: "pointer" }}
            onClick={onEdit}
        />
    );
};

export default ParagraphElement;
