import output from "./output.json";
import { GalleryType, PhotoType } from "types";

type Data = {
    photos: Record<string, PhotoType>;
    galleries: Record<string, GalleryType>;
    backgroundPhotos: PhotoType[];
};

const getData = (): Data => {
    const backgroundPhotos: PhotoType[] = Object.values(output.photos).filter(
        ({ isBackgroundPhoto }) => isBackgroundPhoto
    );

    return {
        photos: output.photos,
        galleries: output.galleries,
        backgroundPhotos,
    };
};

export default getData;
