import { Clusterer, Placemark } from "@pbe/react-yandex-maps";
import { useContext } from "react";

import "./styles.scss";

import ModalContext from "@contexts/ModalContext";
import { useGetMapNPOsQuery } from "@services/api/map.api";
import type { IMapItem } from "@app-types/map.types";

const MapContent = () => {
    const { open } = useContext(ModalContext);
    const { data } = useGetMapNPOsQuery();

    const handlePointClick = (npo: IMapItem["info"]) => {
        open({
            content: <></>,
            props: {
                title: "Просмотр точки",
                footer: <></>,
                className: "modal-point-preview",
                fullHeight: true,
            },
        });
    };

    return (
        <>
            {data && (
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
            )}
        </>
    );
};

export default MapContent;
