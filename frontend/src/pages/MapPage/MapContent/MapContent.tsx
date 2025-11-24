import { Clusterer, Placemark } from "@pbe/react-yandex-maps";
import { useContext, useEffect, useRef } from "react";
import { App } from "antd";

import "./styles.scss";

import ModalContext from "@contexts/ModalContext";
import { useGetMapNPOsQuery } from "@services/api/map.api";
import type { IMapItem } from "@app-types/map.types";
import NPOInfoModal from "./NPOInfoModal";
import { useCity } from "@hooks/useCity";

const MapContent = () => {
    const { open, close } = useContext(ModalContext);
    const { currentCity } = useCity();
    const { data, isLoading, isFetching, error } = useGetMapNPOsQuery(currentCity);
    const { notification } = App.useApp();
    const notificationShownRef = useRef<string | null>(null);

    const handlePointClick = (npoInfo: IMapItem["info"]) => {
        open({
            content: <NPOInfoModal npoInfo={npoInfo} onClose={close} />,
            props: {
                title: "Просмотр информации об НКО",
                footer: <></>,
                className: "modal-point-preview",
                fullHeight: true,
            },
        });
    };

    // Сбрасываем флаг при смене города
    useEffect(() => {
        notificationShownRef.current = null;
    }, [currentCity]);

    // Показываем уведомление, если для выбранного города нет НКО (только один раз для каждого города)
    useEffect(() => {
        // Показываем уведомление только если:
        // 1. Данные загружены (не isLoading и не isFetching)
        // 2. Нет ошибок
        // 3. Город выбран
        // 4. Данные определены и массив пустой
        // 5. Уведомление еще не было показано для этого города
        if (
            !isLoading &&
            !isFetching &&
            !error &&
            currentCity &&
            data !== undefined &&
            Array.isArray(data) &&
            data.length === 0
        ) {
            if (notificationShownRef.current !== currentCity) {
                notificationShownRef.current = currentCity;
                notification.info({
                    message: "НКО не найдены",
                    description: `В городе "${currentCity}" пока нет зарегистрированных некоммерческих организаций.`,
                    placement: "topRight",
                    duration: 5,
                });
            }
        }
    }, [data, isLoading, isFetching, error, currentCity, notification]);

    if (isLoading) {
        return null;
    }

    if (error) {
        console.error("Ошибка загрузки точек НКО:", error);
        return null;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <>
            <Clusterer
                options={{
                    preset: "islands#invertedDarkBlueClusterIcons",
                    groupByCoordinates: false,
                }}
            >
                {data.map((item) => (
                    <Placemark
                        geometry={item.coordinates}
                        options={{ preset: "islands#darkBlueHeartIcon" }}
                        key={item.info.id}
                        onClick={() => handlePointClick(item.info)}
                    />
                ))}
            </Clusterer>
        </>
    );
};

export default MapContent;
