import { Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useAccessibility } from "@contexts/AccessibilityContext";
import "./styles.scss";

const AccessibilityButton = () => {
    const { isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();

    return (
        <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={toggleAccessibilityMode}
            className={`accessibility-button ${isAccessibilityMode ? "active" : ""}`}
            title={isAccessibilityMode ? "Отключить версию для слабовидящих" : "Включить версию для слабовидящих"}
        >
            Версия для слабовидящих
        </Button>
    );
};

export default AccessibilityButton;

