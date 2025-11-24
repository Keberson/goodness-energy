import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CityState {
    currentCity: string;
    availableCities: string[];
}

// Загружаем сохраненный город из localStorage при инициализации
const getInitialCity = (): string => {
    const savedCity = localStorage.getItem("selectedCity");
    return savedCity || "Ангарск";
};

const initialState: CityState = {
    currentCity: getInitialCity(),
    availableCities: [
        "Ангарск",
        "Байкальск",
        "Балаково",
        "Билибино",
        "Волгодонск",
        "Глазов",
        "Десногорск",
        "Димитровград",
        "Железногорск",
        "Заречный (Пензенская область)",
        "Заречный (Свердловская область)",
        "Зеленогорск",
        "Краснокаменск",
        "Курчатов",
        "Лесной",
        "Неман",
        "Нововоронеж",
        "Новоуральск",
        "Обнинск",
        "Озерск",
        "Певек",
        "Полярные Зори",
        "Саров",
        "Северск",
        "Снежинск",
        "Советск",
        "Сосновый Бор",
        "Трехгорный",
        "Удомля",
        "Усолье-Сибирское",
        "Электросталь",
        "Энергодар",
    ],
};

const citySlice = createSlice({
    name: "city",
    initialState,
    reducers: {
        setCurrentCity: (state, action: PayloadAction<string>) => {
            state.currentCity = action.payload;
            // Сохраняем выбранный город в localStorage
            localStorage.setItem("selectedCity", action.payload);
        },
        addCity: (state, action: PayloadAction<string>) => {
            if (!state.availableCities.includes(action.payload)) {
                state.availableCities.push(action.payload);
            }
        },
    },
});

export const { setCurrentCity, addCity } = citySlice.actions;
export default citySlice.reducer;
