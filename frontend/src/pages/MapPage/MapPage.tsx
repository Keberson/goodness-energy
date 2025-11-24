import { YMaps, Map, ZoomControl, FullscreenControl, Button } from "@pbe/react-yandex-maps";
import { useEffect, useState } from "react";

import "./styles.scss";

import MapContent from "./MapContent/MapContent";

import { useCity } from "@hooks/useCity";
import { useGetCityCoordinatesQuery } from "@services/api/map.api";

type MapLayers = "polygons" | "points";

const MapPage = () => {
    const { currentCity } = useCity();
    const { data: cityCoordinates } = useGetCityCoordinatesQuery();

    const defaultMapState: { center: [number, number]; zoom: number } = {
        center: [55.7558, 37.6173], // Москва по умолчанию
        zoom: 10,
    };

    const [mapState, setMapState] = useState<{ center: [number, number]; zoom: number }>(
        defaultMapState
    );

    useEffect(() => {
        if (cityCoordinates && currentCity && cityCoordinates[currentCity]) {
            const cityData = cityCoordinates[currentCity];
            setMapState({
                center: cityData.center,
                zoom: cityData.zoom,
            });
        }
    }, [currentCity, cityCoordinates]);

    return (
        <div className="map-wrapper">
            <YMaps>
                <Map
                    state={mapState}
                    className="map"
                    onBoundsChange={(e: any) =>
                        setMapState({ center: e.get("newCenter"), zoom: e.get("newZoom") })
                    }
                >
                    <ZoomControl />
                    <FullscreenControl />
                    <Button
                        data={{ content: "К городу" }}
                        options={{ selectOnClick: false }}
                        onClick={() => {
                            if (cityCoordinates && currentCity && cityCoordinates[currentCity]) {
                                const cityData = cityCoordinates[currentCity];
                                setMapState({
                                    center: cityData.center,
                                    zoom: cityData.zoom,
                                });
                            }
                        }}
                    />

                    <MapContent />
                </Map>
            </YMaps>
        </div>
    );
};

export type { MapLayers };
export default MapPage;
