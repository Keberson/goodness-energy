import { useEffect } from "react";
import { setCurrentCity } from "@services/slices/city.slice";
import { useGetSelectedCityQuery, useUpdateSelectedCityMutation } from "@services/api/auth.api";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export const useCity = () => {
    const dispatch = useAppDispatch();
    const { currentCity, availableCities } = useAppSelector((state) => state.city);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const [updateSelectedCity] = useUpdateSelectedCityMutation();
    
    // Загружаем город из backend, если пользователь авторизован
    const { data: selectedCityData } = useGetSelectedCityQuery(undefined, {
        skip: !isAuthenticated, // Пропускаем запрос, если пользователь не авторизован
    });

    // Обновляем город из backend при загрузке данных (только если город установлен в backend)
    useEffect(() => {
        if (selectedCityData?.selected_city) {
            dispatch(setCurrentCity(selectedCityData.selected_city));
        }
        // Если selected_city === null, оставляем город из localStorage (не перезаписываем)
    }, [selectedCityData, dispatch]);

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
