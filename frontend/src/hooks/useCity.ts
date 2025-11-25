import { useEffect, useRef } from "react";
import { setCurrentCity, setAvailableCities } from "@services/slices/city.slice";
import { useGetSelectedCityQuery, useUpdateSelectedCityMutation } from "@services/api/auth.api";
import { useGetCitiesQuery } from "@services/api/map.api";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export const useCity = () => {
    const dispatch = useAppDispatch();
    const { currentCity, availableCities } = useAppSelector((state) => state.city);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const [updateSelectedCity] = useUpdateSelectedCityMutation();
    
    // Загружаем список городов из бэкенда
    const { data: citiesData } = useGetCitiesQuery();
    
    // Флаг для отслеживания, был ли город загружен из бэкенда при первой загрузке
    // Используем ключ в localStorage для сохранения между перемонтированиями компонента
    const CITY_LOADED_KEY = "cityLoadedFromBackend";
    
    // Загружаем город из backend, если пользователь авторизован
    const { data: selectedCityData, error: selectedCityError } = useGetSelectedCityQuery(undefined, {
        skip: !isAuthenticated, // Пропускаем запрос, если пользователь не авторизован
    });

    // Загружаем список городов из бэкенда при первой загрузке
    useEffect(() => {
        if (citiesData && citiesData.length > 0 && availableCities.length === 0) {
            dispatch(setAvailableCities(citiesData));
            
            // Если текущий город не входит в список доступных городов, выбираем первый город из списка
            const savedCity = localStorage.getItem("selectedCity");
            if (!savedCity || !citiesData.includes(savedCity)) {
                const defaultCity = citiesData[0] || "Ангарск";
                dispatch(setCurrentCity(defaultCity));
            }
        }
    }, [citiesData, availableCities.length, dispatch]);

    // Загружаем город из backend только при первой загрузке данных
    useEffect(() => {
        if (!isAuthenticated) {
            // Если пользователь не авторизован, удаляем флаг
            localStorage.removeItem(CITY_LOADED_KEY);
            return;
        }

        // Загружаем город из бэкенда только один раз при первой загрузке
        if (selectedCityData) {
            const cityLoaded = localStorage.getItem(CITY_LOADED_KEY) === "true";
            
            if (!cityLoaded) {
                // Первая загрузка - устанавливаем флаг
                localStorage.setItem(CITY_LOADED_KEY, "true");
                
                const backendCity = selectedCityData.selected_city;
                
                if (backendCity) {
                    // Если в бэкенде есть город, используем его
                    dispatch(setCurrentCity(backendCity));
                } else {
                    // Если в бэкенде нет города, но есть в localStorage - сохраняем его в бэкенд
                    const savedCity = localStorage.getItem("selectedCity");
                    if (savedCity) {
                        updateSelectedCity({ city: savedCity }).catch(() => {
                            // Игнорируем ошибки при сохранении
                        });
                    }
                }
            }
        }
    }, [selectedCityData, isAuthenticated, dispatch, updateSelectedCity]);

    const changeCity = async (city: string) => {
        dispatch(setCurrentCity(city));
        
        // Сохраняем выбранный город на бэкенде, если пользователь авторизован
        if (isAuthenticated) {
            try {
                await updateSelectedCity({ city }).unwrap();
            } catch (error) {
                console.error("Ошибка при сохранении выбранного города:", error);
                // Не блокируем изменение города на фронтенде, даже если запрос не удался
            }
        }
    };

    return {
        currentCity,
        availableCities,
        changeCity,
    };
};
