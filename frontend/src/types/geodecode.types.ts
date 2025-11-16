export interface IGeodecode {
    response: {
        GeoObjectCollection: {
            featureMember: {
                GeoObject: {
                    Point: {
                        pos: string;
                    };
                };
            }[];
        };
    };
}
