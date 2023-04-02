import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import styled, { css } from "styled-components";
import { FaTimes, FaArrowLeft, FaArrowRight, FaInfo } from "react-icons/fa";

import { Text } from "sharedComponents";
import { PhotoType } from "types";
import { ICON_FONT_SIZES, ICON_COLOR, APP_BORDER, ONE_HUNDRED_VH } from "theme";
import { useCallback } from 'react';

const IconCSS = css`
  fill: ${ICON_COLOR.initial};
  cursor: pointer;

&:hover {
  fill: ${ICON_COLOR.hover};
}
`
const CloseIcon = styled(FaTimes)`${IconCSS}`;
const PreviousButton = styled(FaArrowLeft)`${IconCSS}`;
const NextButton = styled(FaArrowRight)`${IconCSS}`;
const ToggleInfo = styled(FaInfo)`${IconCSS}`;

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
  padding: 0 20px;
  display: inline-block;
  font-weight: 700;
`;

const MetadataAndControlsWrapper = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  right: 0;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;

  svg {
    padding-left: 0.5rem;
  }
`;

const ControlsWrapper = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  margin: 0 0.5rem 0.5rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  height: 1.5rem;
`

const MetadataWrapper = styled.div`
  border-radius: 0.5rem;
  margin: 0 0.25rem 0.25rem;
  padding: 0.5rem;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.7);
  height: 1.5rem;

  & > * {
    font-size: 14px;
    padding: 0;
  }
`;

const StyledPhoto = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 1rem;
  box-sizing: border-box;
  aspect-ratio: inherit;
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

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  ${ONE_HUNDRED_VH}
`

const Photo = ({
  photos,
  filteredPhotoIds,
  selectedFilteredPhotoIndex,
  setSelectedFilteredPhotoIndex,
}: PhotoProps) => {
  const [toggleInfo, setToggleInfo] = useState(false)
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
    <>
      <PhotoWrapper>
        <StyledPhoto
          src={`https://storage.googleapis.com/photo21-asdqwd/photos/large/${details.src}`}
        />
      </PhotoWrapper>
      <MetadataAndControlsWrapper>
        {toggleInfo ? <Metadata details={details} /> : null}
        <ControlsWrapper>
          <ToggleInfo
            size={ICON_FONT_SIZES.l}
            onClick={() => setToggleInfo(prev => !prev)}
          />
          <PreviousButton
            size={ICON_FONT_SIZES.l}
            onClick={() => getNextPhotoIndex("left")}
          />
          <CloseIcon size={ICON_FONT_SIZES.l} onClick={exitSinglePhotoView} />
          <NextButton
            size={ICON_FONT_SIZES.l}
            onClick={() => getNextPhotoIndex("right")}
          />
        </ControlsWrapper>
      </MetadataAndControlsWrapper>
    </>
  );
};

export default Photo;