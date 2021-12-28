import * as React from "react";

import { Header } from "sharedComponents";
import { ICON_FONT_SIZES } from "theme";
import { PhotoType, GalleryType } from "sharedTypes";

import {
  GalleryWrapper,
  GalleryItem,
  ProjectDescriptionWrapper,
} from "./Gallery.styles";

type Props = {
  photoId: string;
  galleryDetails: GalleryType;
  history: any;
  photos: PhotoType[];
  handleSwitchToSelectedPhoto: any
};

const Gallery = ({ photoId, galleryDetails, history, photos, handleSwitchToSelectedPhoto }: Props) => {
  const [visibleImageCount, setVisibleImageCount] = React.useState<number>(15);

  const galleryRef = React.useRef<HTMLInputElement>(null);

  const onScroll = React.useCallback(() => {
    const node = galleryRef.current;
    if (
      node &&
      node.clientHeight !== 0 &&
      visibleImageCount < photos.length &&
      window.innerHeight + window.scrollY >= node.clientHeight - 250
    ) {
      setVisibleImageCount(visibleImageCount + 12);
    }
  }, [photos, visibleImageCount]);

  React.useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  if (!photos.length) {
    return null;
  }
  // return selectedPhotoIndex !== undefined ? (
  // <PhotoWithMetadataWrapper>
  //   <CloseIcon size={ICON_FONT_SIZES.l} onClick={handleSwitchToGrid} />
  //   <PreviousContainer onClick={getPreviousPhotoIndex}>
  //     <PreviousButton size={ICON_FONT_SIZES.l} />
  //   </PreviousContainer>
  //   <NextContainer onClick={getNextPhotoIndex}>
  //     <NextButton size={ICON_FONT_SIZES.l} />
  //   </NextContainer>
  //   <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
  // </PhotoWithMetadataWrapper>
  // ) : (
  return (
    <>
      <ProjectDescriptionWrapper>
        <Header size="medium">{galleryDetails.title}</Header>
      </ProjectDescriptionWrapper>
      <GalleryWrapper ref={galleryRef}>{
        photos.map((photo, index) => (
          <GalleryItem key={photo.id}>
            <img src={`https://storage.googleapis.com/photo21/photos/thumbnail/${photo.src}`} onClick={() => handleSwitchToSelectedPhoto(index)} />
          </GalleryItem>
        ))
      }</GalleryWrapper>
    </>)
  // );
};

export default Gallery;
