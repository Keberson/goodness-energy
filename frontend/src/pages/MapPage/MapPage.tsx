import { YMaps, Map, ZoomControl, FullscreenControl, Button } from "@pbe/react-yandex-maps";
import { useEffect, useState } from "react";

import "./styles.scss";

import MapContent from "./MapContent/MapContent";

import { cityCoordinates } from "./props";

import { useCity } from "@hooks/useCity";

type MapLayers = "polygons" | "points";

const MapPage = () => {
    const { currentCity } = useCity();
    const [mapState, setMapState] = useState<{ center: [number, number]; zoom: number }>(
        cityCoordinates[currentCity]
    );

    useEffect(() => {
        setMapState(cityCoordinates[currentCity]);
    }, [currentCity]);

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
                        onClick={() => setMapState(cityCoordinates[currentCity])}
                    />

                    <MapContent />
                </Map>
            </YMaps>
        </div>
    );
};

export type { MapLayers };
export default MapPage;
