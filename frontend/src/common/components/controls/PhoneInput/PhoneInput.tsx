import { Input, type InputProps, type InputRef } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import InputMask from "inputmask";
import { useEffect, useRef } from "react";

const PhoneInput: React.FC<InputProps> = (props) => {
    const inputRef = useRef<InputRef>(null);
    const maskRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current?.input && maskRef.current !== inputRef.current.input) {
            maskRef.current = inputRef.current.input;
            InputMask("+7 (999) 999-99-99").mask(maskRef.current);
        }
    }, []);

    return (
        <Input
            {...props}
            ref={inputRef}
            prefix={<PhoneOutlined />}
            placeholder="+7 (999) 999-99-99"
            size="large"
        />
    );
};

export default PhoneInput;
