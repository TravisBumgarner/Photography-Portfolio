type GalleryType = {
  title: string;
  content_type: string;
  slug: string;
};

type CategoryType = string[];

type LocationType = string;

type PhotoType = {
  id: string;
  src: string;
  gallery: GalleryType;
  location: LocationType;
  date_taken: string
  categories: CategoryType;
  camera_type: string;
  make: string;
  model: string;
  lens: string;
  shooting_mode: string;
  aperture: string;
  shutter_speed: string;
  iso: string;
  focal_length: string;
  is_home_background: boolean;
};

export { LocationType, CategoryType, GalleryType, PhotoType };
