import { FullscreenControl, ZoomControl } from "@pbe/react-yandex-maps";

const MapToolbar = () => {
    return (
        <>
            <ZoomControl />
            <FullscreenControl />
        </>
    );
};

export default MapToolbar;
