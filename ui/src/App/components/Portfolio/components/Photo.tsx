import React, { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react'
import styled, { createGlobalStyle, css } from "styled-components";
import { FaTimes, FaArrowLeft, FaArrowRight, FaInfo, FaDownload } from "react-icons/fa";
import Modal from 'react-modal';

import Metadata from './Metadata';
import { PhotoType } from "types";
import { ICON_FONT_SIZES, ICON_COLOR } from "theme";

type PhotoProps = {
  photos: { [id: string]: PhotoType };
  filteredPhotoIds: string[];
  selectedFilteredPhotoIndex: number;
  setSelectedFilteredPhotoIndex: Dispatch<SetStateAction<number>>;
  onCloseCallback: (id: string) => void;
  downloadingEnabled: boolean;
};

const Photo = ({
  photos,
  filteredPhotoIds,
  selectedFilteredPhotoIndex,
  setSelectedFilteredPhotoIndex,
  onCloseCallback,
  downloadingEnabled,
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
    onCloseCallback(details.id)
  }

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      getNextPhotoIndex("left");
    } else if (event.key === "ArrowRight") {
      getNextPhotoIndex("right");
    }
  };

  const downloadPhoto = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = `https://storage.googleapis.com/photo21-asdqwd/photos/large/${details.src}`;;
    downloadLink.download = details.src;
    document.body.append(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedFilteredPhotoIndex]);

  if (!details) return null

  return (
    <>
      <OverflowHidden />
      <Modal isOpen={!!setSelectedFilteredPhotoIndex} style={modalCSS} onRequestClose={exitSinglePhotoView}>
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
            {downloadingEnabled && <DownloadButton
              size={ICON_FONT_SIZES.l}
              onClick={downloadPhoto}
            />}
          </ControlsWrapper>
        </MetadataAndControlsWrapper>
      </Modal >
    </>
  );
};

const OverflowHidden = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

const modalCSS = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 0,
    width: '100%',
    height: '100%',
    padding: '1rem',
  },
};

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
const DownloadButton = styled(FaDownload)`${IconCSS}`;


const MetadataAndControlsWrapper = styled.div`
  display: flex;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
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

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const StyledPhoto = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 1rem;
  box-sizing: border-box;
  aspect-ratio: inherit;
  user-select: none;
`;


export default Photo;