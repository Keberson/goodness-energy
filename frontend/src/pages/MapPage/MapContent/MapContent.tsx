import { Clusterer, Placemark } from "@pbe/react-yandex-maps";
import { useContext } from "react";

import "./styles.css";

import ModalContext from "@contexts/ModalContext";

const MapContent = () => {
    const { open } = useContext(ModalContext);

    // const handlePointClick = (photoId: number, statistics?: PhotoStatistics) => {
    //     open({
    //         content: <PointPreview id={photoId} statistics={statistics} />,
    //         props: {
    //             title: "Просмотр точки",
    //             footer: <></>,
    //             className: "modal-point-preview",
    //             fullHeight: true,
    //         },
    //     });
    // };

    return (
        <>
            {/* {dataType === "polygons" &&
                polygonsData &&
                polygonsData.map((item) => <MapPolygon item={item} key={item.area_id} />)}
            {dataType === "points" && pointsData && (
                <Clusterer
                    options={{
                        preset: "islands#darkGreenClusterIcons",
                        groupByCoordinates: false,
                    }}
                >
                    {pointsData.map((item) => (
                        <Placemark
                            geometry={[item.latitude, item.longitude]}
                            options={{ preset: "islands#darkGreenVegetationIcon" }}
                            key={item.photo_id}
                            onClick={() =>
                                handlePointClick(item.photo_id, item.statistics || undefined)
                            }
                        />
                    ))}
                </Clusterer>
            )} */}
        </>
    );
};

export default MapContent;
