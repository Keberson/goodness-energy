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
    availableCities: [], // Будет загружено из бэкенда
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
        setAvailableCities: (state, action: PayloadAction<string[]>) => {
            state.availableCities = action.payload;
        },
        addCity: (state, action: PayloadAction<string>) => {
            if (!state.availableCities.includes(action.payload)) {
                state.availableCities.push(action.payload);
            }
        },
    },
});

export const { setCurrentCity, setAvailableCities, addCity } = citySlice.actions;
export default citySlice.reducer;
