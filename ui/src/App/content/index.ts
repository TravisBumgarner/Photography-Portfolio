import output from "./output.json";
import { GalleryType, PhotoType } from "types";

type Data = {
  photos: { [id: string]: PhotoType };
  galleries: Record<string, GalleryType>;
  backgroundPhotos: PhotoType[];
};

const getData = (): Data => {
  const backgroundPhotos: PhotoType[] = Object.values(output.photos).filter(
    ({ isBackgroundPhoto }) => isBackgroundPhoto
  );

  return {
    photos: output.photos as unknown as { string: PhotoType },
    galleries: output.galleries,
    backgroundPhotos,
  };
};

export default getData;
