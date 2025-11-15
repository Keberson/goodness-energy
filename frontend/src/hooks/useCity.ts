import { setCurrentCity } from "@services/slices/city.slice";

import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export const useCity = () => {
    const dispatch = useAppDispatch();
    const { currentCity, availableCities } = useAppSelector((state) => state.city);

    const changeCity = (city: string) => {
        dispatch(setCurrentCity(city));
    };

    return {
        currentCity,
        availableCities,
        changeCity,
    };
};
