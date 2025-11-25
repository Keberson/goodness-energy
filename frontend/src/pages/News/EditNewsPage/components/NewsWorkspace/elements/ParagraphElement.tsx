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
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ lineHeight: "1.6", cursor: "pointer" }}
            onClick={onEdit}
        />
    );
};

export default ParagraphElement;

// {
//     "title": "моя новость",
//     "type": "blog",
//     "elements": [
//         {
//             "id": "element-1764098587762-0.03224824142057381",
//             "type": "divider",
//             "content": ""
//         },
//         {
//             "id": "element-1764098576294-0.5356064504689622",
//             "type": "file",
//             "content": 4,
//             "props": {}
//         },
//         {
//             "id": "element-1764098558278-0.3782966032778303",
//             "type": "link",
//             "content": "Текст ссылки",
//             "props": {
//                 "url": ""
//             }
//         },
//         {
//             "id": "element-1764098556554-0.4057724127695065",
//             "type": "quote",
//             "content": "Введите цитату..."
//         },
//         {
//             "id": "element-1764098554528-0.932051530083102",
//             "type": "list",
//             "content": [
//                 "Элемент списка 1",
//                 "Элемент списка 2"
//             ]
//         },
//         {
//             "id": "element-1764098532402-0.7104248305443862",
//             "type": "image",
//             "content": [
//                 3
//             ],
//             "props": {
//                 "caption": "Отвертка"
//             }
//         },
//         {
//             "id": "element-1764094764894-0.696751066893182",
//             "type": "paragraph",
//             "content": "<p><span style=\"color: rgb(187, 187, 187);\">Введите</span><a href=\"фа\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(187, 187, 187);\"> текст...</a></p>"
//         },
//         {
//             "id": "element-1764098522555-0.0795938899141192",
//             "type": "heading",
//             "content": "Новый заголовок",
//             "props": {
//                 "level": 2
//             }
//         },
//         {
//             "id": "element-1764098526296-0.7930359156929471",
//             "type": "image",
//             "content": 0
//         }
//     ]
// }
