import { YMaps, Map } from "@pbe/react-yandex-maps";

import "./styles.scss";

import MapContent from "./MapContent/MapContent";
import MapToolbar from "./MapToolbar/MapToolbar";

type MapLayers = "polygons" | "points";

const MapPage = () => {
    const defaultState = {
        center: [55.751115, 37.623879],
        zoom: 11,
    };

    return (
        <div className="map-wrapper">
            <YMaps>
                <Map defaultState={defaultState} className="map">
                    <MapToolbar />
                    <MapContent />
                </Map>
            </YMaps>
        </div>
    );
};

export type { MapLayers };
export default MapPage;
