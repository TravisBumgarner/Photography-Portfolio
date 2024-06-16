export type GalleryType = {
  title: string;
  slug: string;
}

export type PhotoType = {
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

export type PrivateGallery = {
  gallery: GalleryType;
  photos: {
    [id: string]: PhotoType
  }
}

