import { Clusterer, Placemark } from "@pbe/react-yandex-maps";
import { useContext } from "react";

import "./styles.scss";

import ModalContext from "@contexts/ModalContext";
import { useGetMapNPOsQuery } from "@services/api/map.api";
import type { IMapItem } from "@app-types/map.types";
import NPOInfoModal from "./NPOInfoModal";

const MapContent = () => {
    const { open, close } = useContext(ModalContext);
    const { data } = useGetMapNPOsQuery();

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
