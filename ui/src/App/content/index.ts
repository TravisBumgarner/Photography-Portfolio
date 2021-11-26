import output from "./output.json";
import {
  GalleryType,
  PhotoType,
  LocationType,
  CategoryType,
} from "sharedTypes";

type Data = {
  photos: PhotoType[];
  galleries: GalleryType[];
  locations: LocationType[];
  categories: CategoryType[];
  backgroundPhotos: PhotoType[];
};

const getData = (): Data => {
  const locations: LocationType[] = [];
  const categories: CategoryType[] = [];
  const backgroundPhotos: PhotoType[] = output.photos.filter(
    ({ is_home_background }) => is_home_background
  );

  return {
    photos: output.photos as unknown as PhotoType[],
    galleries: output.galleries,
    locations,
    categories,
    backgroundPhotos,
  };
};

export default getData;
