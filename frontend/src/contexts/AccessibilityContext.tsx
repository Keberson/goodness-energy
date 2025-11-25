import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilityContextType {
    isAccessibilityMode: boolean;
    toggleAccessibilityMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [isAccessibilityMode, setIsAccessibilityMode] = useState<boolean>(() => {
        // Загружаем состояние из localStorage при инициализации
        const saved = localStorage.getItem("accessibilityMode");
        return saved === "true";
    });

    useEffect(() => {
        // Применяем класс к body при изменении состояния
        if (isAccessibilityMode) {
            document.body.classList.add("accessibility-mode");
        } else {
            document.body.classList.remove("accessibility-mode");
        }
    }, [isAccessibilityMode]);

    const toggleAccessibilityMode = () => {
        setIsAccessibilityMode((prev) => {
            const newValue = !prev;
            // Сохраняем состояние в localStorage
            localStorage.setItem("accessibilityMode", String(newValue));
            return newValue;
        });
    };

    return (
        <AccessibilityContext.Provider value={{ isAccessibilityMode, toggleAccessibilityMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error("useAccessibility must be used within an AccessibilityProvider");
    }
    return context;
};

