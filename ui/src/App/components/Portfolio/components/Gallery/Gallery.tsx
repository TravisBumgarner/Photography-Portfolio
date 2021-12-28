import * as React from "react";

import { PhotoWithMetadata } from "./components";
import { Header } from "sharedComponents";
import { ICON_FONT_SIZES } from "theme";
import { PhotoType, GalleryType } from "sharedTypes";

import {
  GalleryWrapper,
  GalleryItem,
  PreviousButton,
  NextButton,
  PhotoWithMetadataWrapper,
  CloseIcon,
  ProjectDescriptionWrapper,
  NextContainer,
  PreviousContainer,
} from "./Gallery.styles";

type Props = {
  photoId: string;
  galleryDetails: GalleryType;
  history: any;
  photos: PhotoType[];
};

const Gallery = ({ photoId, galleryDetails, history, photos }: Props) => {
  const [visibleImageCount, setVisibleImageCount] = React.useState<number>(15);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<
    number | undefined
  >(undefined);
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

  const getPreviousPhotoIndex = () => {
    if (selectedPhotoIndex === undefined) {
      return;
    }

    const newSelectedPhotoIndex =
      selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newSelectedPhotoIndex);
    handleUrlChange(newSelectedPhotoIndex);
  };

  const getNextPhotoIndex = () => {
    if (selectedPhotoIndex === undefined) {
      return;
    }

    const newSelectedPhotoIndex =
      selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newSelectedPhotoIndex);
    handleUrlChange(newSelectedPhotoIndex);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (selectedPhotoIndex === undefined) {
      return;
    }

    if (event.key === "ArrowLeft") {
      getPreviousPhotoIndex();
    } else if (event.key === "ArrowRight") {
      getNextPhotoIndex();
    } else if (event.key === "Escape") {
      handleSwitchToGrid();
    }
  };

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedPhotoIndex]);

  const handleSwitchToSelectedPhoto = (newSelectedPhotoIndex: number) => {
    setSelectedPhotoIndex(newSelectedPhotoIndex);
    handleUrlChange(newSelectedPhotoIndex);
  };

  const handleSwitchToGrid = () => {
    setSelectedPhotoIndex(undefined);
    handleUrlChange(undefined);
  };

  const handleUrlChange = (newSelectedPhotoIndex: number | undefined) => {
    if (newSelectedPhotoIndex !== undefined) {
      const { id } = photos[newSelectedPhotoIndex];
      history.push(
        `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${id}`
      );
    } else {
      history.push(
        `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}`
      );
    }
  };

  const getSelectedPhotoFromUrl = () => {
    if (photoId !== undefined) {
      let indexFound;
      photos.forEach((photo, index) => {
        if (photo.id === photoId) {
          indexFound = index;
        }
      });
      if (indexFound !== undefined) {
        setSelectedPhotoIndex(indexFound);
      }
    }
  };

  React.useEffect(getSelectedPhotoFromUrl, [photos]);

  if (!photos.length) {
    return null;
  }
  return selectedPhotoIndex !== undefined ? (
    <PhotoWithMetadataWrapper>
      <CloseIcon size={ICON_FONT_SIZES.l} onClick={handleSwitchToGrid} />
      <PreviousContainer onClick={getPreviousPhotoIndex}>
        <PreviousButton size={ICON_FONT_SIZES.l} />
      </PreviousContainer>
      <NextContainer onClick={getNextPhotoIndex}>
        <NextButton size={ICON_FONT_SIZES.l} />
      </NextContainer>
      <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
    </PhotoWithMetadataWrapper>
  ) : (
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
    </>
  );
};

export default Gallery;
