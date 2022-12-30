import React, { Dispatch, SetStateAction, useEffect } from 'react'
import styled from "styled-components";
import { FaTimes, FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";

import { Text, Header } from "sharedComponents";
import { PhotoType } from "types";
import { ICON_FONT_SIZES, ICON_COLOR, APP_BORDER } from "theme";
import { useCallback } from 'react';

const FILM = "Film";
const CONTROLS_WRAPPER_HEIGHT = "3rem";
const TOP_ROW = "20px";

const CloseIcon = styled(FaTimes)`
  position: fixed;
  right: 20px;
  top: ${TOP_ROW};
  z-index: 999;
  fill: ${ICON_COLOR.initial};

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`;

const PreviousButton = styled(FaArrowCircleLeft)`
  left: 20px;
  fill: ${ICON_COLOR.initial};

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`;
const NextButton = styled(FaArrowCircleRight)`
  fill: ${ICON_COLOR.initial};
  cursor: pointer;

  &:hover {
    fill: ${ICON_COLOR.hover};
  }
`;

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
  padding: 0 20px;
  display: inline-block;
  font-weight: 700;
`;

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(100vw - ${APP_BORDER} * 2);
  height: calc(100vh - ${APP_BORDER} * 2);
`;

const ControlsWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
  height: ${CONTROLS_WRAPPER_HEIGHT};
  box-sizing: border-box;
  align-items: center;

  & > * {
    margin: 0 20px;
  }
`;

const MetadataWrapper = styled.div`
  width: 80%;
  margin: 0 10%;
  text-align: center;
  position: fixed;
  top: ${TOP_ROW};
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);

  & > * {
    font-size: 14px;
    padding: 0;
  }
`;

const StyledPhoto = styled.img`
  max-width: 100%;
  max-height: calc(100% - ${CONTROLS_WRAPPER_HEIGHT} * 2);
`;

const Metadata = ({ details }: { details: PhotoType }) => {
  const {
    camera,
    aperture,
    shutterSpeed,
    iso,
    lens,
    focalLength,
    location
  } = details;

  const gearString = `${camera} ${lens}`
  const statsString =
    aperture || shutterSpeed || iso || focalLength
      ? `${aperture} ${shutterSpeed} ${iso} ${focalLength}`
      : "N/A";

  return (
    <MetadataWrapper>
      <Text>
        <>
          {location}
          <Spacer />
          {gearString}
          <Spacer />
          {statsString}
        </>
      </Text>
    </MetadataWrapper>
  );
};

type PhotoProps = {
  photos: { [id: string]: PhotoType };
  filteredPhotoIds: string[];
  selectedFilteredPhotoIndex: number;
  setSelectedFilteredPhotoIndex: Dispatch<SetStateAction<number>>;
};

const Photo = ({
  photos,
  filteredPhotoIds,
  selectedFilteredPhotoIndex,
  setSelectedFilteredPhotoIndex,
}: PhotoProps) => {
  const details = photos[filteredPhotoIds[selectedFilteredPhotoIndex]];

  const getNextPhotoIndex = useCallback((direction: "left" | "right") => {
    const first = 0;
    const last = filteredPhotoIds.length - 1;
    let next;

    if (direction === "left") {
      next = selectedFilteredPhotoIndex - 1;
      if (next < first) {
        next = last;
      }
    } else {
      next = selectedFilteredPhotoIndex + 1;
      if (next > last) {
        next = first;
      }
    }
    setSelectedFilteredPhotoIndex(next);
  }, [selectedFilteredPhotoIndex, filteredPhotoIds]);

  const exitSinglePhotoView = () => {
    setSelectedFilteredPhotoIndex(undefined);
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      getNextPhotoIndex("left");
    } else if (event.key === "ArrowRight") {
      getNextPhotoIndex("right");
    } else if (event.key === "Escape") {
      exitSinglePhotoView();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedFilteredPhotoIndex]);

  return (
    <div>
      <CloseIcon size={ICON_FONT_SIZES.l} onClick={exitSinglePhotoView} />
      <PhotoWrapper>
        <StyledPhoto
          src={`https://storage.googleapis.com/photo21-asdqwd/photos/large/${details.src}`}
        />
      </PhotoWrapper>
      <Metadata details={details} />
      <ControlsWrapper>
        <PreviousButton
          size={ICON_FONT_SIZES.l}
          onClick={() => getNextPhotoIndex("left")}
        />
        <NextButton
          size={ICON_FONT_SIZES.l}
          onClick={() => getNextPhotoIndex("right")}
        />
      </ControlsWrapper>
    </div>
  );
};

export default Photo;