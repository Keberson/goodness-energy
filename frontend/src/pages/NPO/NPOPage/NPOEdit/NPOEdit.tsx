import { Button, Flex, Form } from "antd";

import type { INPO, INPOEdit } from "@app-types/npo.types";

import NPOForm from "@components/NPOForm/NPOForm";

import { useEditNPOMutation } from "@services/api/npo.api";

interface NPOEditProps {
    data: INPO;
    onCancel: () => void;
}

const NPOEdit: React.FC<NPOEditProps> = ({ data, onCancel }) => {
    const [editNPO] = useEditNPOMutation();

    const handleSave = async (values: INPOEdit) => {
        await editNPO({
            id: data.id,
            body: {
                ...values,
                galleryIds: [],
                links: values.links.reduce<Record<string, string>>((acc, current, index) => {
                    acc[`${current.type}-${index}`] = current.url;
                    return acc;
                }, {}),
            },
        });
        onCancel();
    };

    return (
        <Form layout="vertical" initialValues={data} onFinish={handleSave}>
            <NPOForm />

            <Flex gap={8} justify="flex-end">
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" htmlType="submit">
                    Сохранить
                </Button>
            </Flex>
        </Form>
    );
};

export default NPOEdit;
