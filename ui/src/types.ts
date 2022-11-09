type GalleryType = {
  title: string;
  slug: string;
}

type PhotoType = {
  id: string;
  src: string;
  gallery: string;
  location: string;
  dateTaken: string;
  camera: string;
  lens: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  focalLength: string;
  isBackgroundPhoto: boolean;
};

export {
  GalleryType,
  PhotoType
};
