import React, { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react'
import styled, { createGlobalStyle, css } from "styled-components";
import { FaTimes, FaArrowLeft, FaArrowRight, FaInfo, FaDownload } from "react-icons/fa";
import Modal from 'react-modal';

import Metadata from './Metadata';
import { PhotoType } from "types";
import { ICON_FONT_SIZES, ICON_COLOR } from "theme";
import { getPhotoUrl } from '../../../utils';

type PhotoProps = {
  photos: { [id: string]: PhotoType };
  filteredPhotoIds: string[];
  selectedFilteredPhotoIndex: number;
  setSelectedFilteredPhotoIndex: Dispatch<SetStateAction<number>>;
  onCloseCallback: (id: string) => void;
  privateGallery: boolean;
  gallerySlug: string;
};

const Photo = ({
  photos,
  filteredPhotoIds,
  selectedFilteredPhotoIndex,
  setSelectedFilteredPhotoIndex,
  onCloseCallback,
  privateGallery,
  gallerySlug
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
    downloadLink.href = getPhotoUrl({ isThumbnail: false, privateGalleryId: privateGallery ? gallerySlug : undefined, photoSrc: details.src })
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
        <ControlsTopWrapper>
          <CloseIcon size={ICON_FONT_SIZES.l} onClick={exitSinglePhotoView} />
        </ControlsTopWrapper>
        <PhotoWrapper>
          <StyledPhoto
            src={getPhotoUrl({ isThumbnail: false, privateGalleryId: privateGallery ? gallerySlug : undefined, photoSrc: details.src })}
          />
        </PhotoWrapper>
        <MetadataAndControlsBottomWrapper>
          {toggleInfo ? <Metadata details={details} /> : null}
          <ControlsWrapper>
            <div>
              <ToggleInfo
                size={ICON_FONT_SIZES.l}
                onClick={() => setToggleInfo(prev => !prev)}
              />
            </div>
            <div>
              <PreviousButton
                style={{ marginRight: '2rem' }}
                size={ICON_FONT_SIZES.xl}
                onClick={() => getNextPhotoIndex("left")}
              />
              <NextButton
                style={{ marginLeft: '2rem' }}

                size={ICON_FONT_SIZES.xl}
                onClick={() => getNextPhotoIndex("right")}
              />
            </div>
            <div>
              {privateGallery && <DownloadButton
                size={ICON_FONT_SIZES.l}
                onClick={downloadPhoto}
              />}
            </div>
          </ControlsWrapper>
        </MetadataAndControlsBottomWrapper>
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


const MetadataAndControlsBottomWrapper = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  box-sizing: border-box;
  align-items: center;
  flex-direction: column;
  padding: 2rem;
`;

const ControlsTopWrapper = styled.div`
  position: fixed;
  right: 2rem;
  top: 2rem;
`;

const ControlsWrapper = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  margin: 0 0.5rem 0.5rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.7);
  height: 1.5rem;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
  width: 100%;
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