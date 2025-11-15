import { Select, Typography } from "antd";

import { useCity } from "@hooks/useCity";

const { Text } = Typography;
const { Option } = Select;

const CityModal = () => {
    const { currentCity, availableCities, changeCity } = useCity();

    return (
        <>
            <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
                Здесь вы можете выбрать другой город. При измении города платформа будет предлагать
                события и организации для выбранного города.
            </Text>
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Выберете город из предложенного списка
            </Text>

            <Select
                style={{ width: "100%" }}
                placeholder="Выберите город"
                value={currentCity}
                onChange={changeCity}
                size="large"
                showSearch
            >
                {availableCities.map((city) => (
                    <Option key={city} value={city}>
                        {city}
                    </Option>
                ))}
            </Select>
        </>
    );
};

export default CityModal;
