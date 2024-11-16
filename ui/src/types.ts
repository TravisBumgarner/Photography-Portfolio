export type GalleryType = {
  title: string;
  slug: string;
  previewSrc: string;
  previewId: string
}

export type PhotoType = {
  id: string;
  src: string;
  galleryIds: string[];
  dateTaken: string;
  camera: string;
  lens: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  focalLength: string;
  blurHash: string;
};

export type PrivateGallery = {
  gallery: GalleryType;
  photos: {
    [id: string]: PhotoType
  }
}

