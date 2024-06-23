import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaDownload, FaInfo, FaTimes } from "react-icons/fa";
import Modal from 'react-modal';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled, { createGlobalStyle, css } from "styled-components";

import { ICON_COLOR, ICON_FONT_SIZES } from "theme";
import { context } from '../../context';
import { getPhotoUrl } from '../../utils';
import Metadata from './components/Metadata';

type PhotoProps = {
  // photos: { [id: string]: PhotoType };
  // filteredPhotoIds: string[];
  // selectedFilteredPhotoIndex: number;
  // setSelectedFilteredPhotoIndex: Dispatch<SetStateAction<number>>;
  // onCloseCallback: (id: string) => void;
  privateGallery: boolean;
  // gallerySlug: string;
};

const Photo = ({
  // photos,
  // filteredPhotoIds,
  // selectedFilteredPhotoIndex,
  // setSelectedFilteredPhotoIndex,
  // onCloseCallback
  privateGallery,
  // gallerySlug
}: PhotoProps) => {
  const { state: { photos, selectedGalleryPhotoIds }, dispatch } = useContext(context)
  const { gallerySlug, photoSlug } = useParams<{ gallerySlug: string, photoSlug: string }>();

  const details = photoSlug ? photos[photoSlug] : null;
  const [toggleInfo, setToggleInfo] = useState(false)
  const navigate = useNavigate();
  console.log(selectedGalleryPhotoIds)

  useEffect(() => {
    if (!photoSlug) {
      navigate('/')
      return
    };

    // On initial load for a url, we need to set the selectedGalleryPhotoIds
    if (!selectedGalleryPhotoIds) {
      dispatch({
        type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
        payload: {
          selectedGalleryPhotoIds: Object
            .values(photos)
            .filter(({ gallery }) => gallery === gallerySlug)
            .map(({ id }) => id)
        }
      })
    }
  }, [photos, photoSlug, selectedGalleryPhotoIds, gallerySlug])

  const getNextPhotoIndex = useCallback((direction: 'left' | 'right') => {
    console.log('intro', selectedGalleryPhotoIds, photoSlug)
    console.log('getNextPhotoIndex')
    if (!photoSlug || !selectedGalleryPhotoIds) {
      navigate('/')
      return
    };

    const index = selectedGalleryPhotoIds.indexOf(photoSlug)
    const nextIndex = direction === "left" ? index - 1 : index + 1;
    const first = 0;
    const last = selectedGalleryPhotoIds.length - 1;
    if (nextIndex < first) {
      console.log('first', selectedGalleryPhotoIds[first])
      return selectedGalleryPhotoIds[last]
    }
    if (nextIndex > last) {
      console.log('last', selectedGalleryPhotoIds[last])
      return selectedGalleryPhotoIds[first]
    }
    console.log('nextIndex', selectedGalleryPhotoIds[nextIndex])
    navigate(`/${gallerySlug}/${selectedGalleryPhotoIds[nextIndex]}`)

  }, [selectedGalleryPhotoIds, photoSlug])

  const exitSinglePhotoView = () => {
    navigate(`/${gallerySlug}`)
  }



  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") getNextPhotoIndex("left");
    if (event.key === "ArrowRight") getNextPhotoIndex("right");
  };

  const downloadPhoto = () => {
    if (!details) return

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
  }, []);

  if (!details) return null

  return (
    <>
      <OverflowHidden />
      <Modal isOpen={true} style={modalCSS} onRequestClose={exitSinglePhotoView}>
        <PhotoWrapper>
          <StyledPhoto
            src={getPhotoUrl({ isThumbnail: false, privateGalleryId: privateGallery ? gallerySlug : undefined, photoSrc: details.src })}
          />
        </PhotoWrapper>
        <MetadataAndControlsBottomWrapper>
          {toggleInfo ? <Metadata details={details} /> : null}
          <ControlsWrapper>
            <ControlsSectionWrapper hideBackground={!privateGallery}>
              {privateGallery && <DownloadButton
                size={ICON_FONT_SIZES.l}
                onClick={downloadPhoto}
              />}
            </ControlsSectionWrapper>
            <ControlsSectionWrapper>
              <PreviousButton
                style={{ marginRight: '2rem' }}
                size={ICON_FONT_SIZES.xl}
                onClick={() => getNextPhotoIndex("left")}
              />
              <ToggleInfo
                size={ICON_FONT_SIZES.l}
                onClick={() => setToggleInfo(prev => !prev)}
              />

              <NextButton
                style={{ marginLeft: '2rem' }}

                size={ICON_FONT_SIZES.xl}
                onClick={() => getNextPhotoIndex("right")}
              />
            </ControlsSectionWrapper>
            <ControlsSectionWrapper>
              <Link to={`/${gallerySlug}`}>
                <CloseIcon size={ICON_FONT_SIZES.l} />
              </Link>
            </ControlsSectionWrapper>
          </ControlsWrapper>
        </MetadataAndControlsBottomWrapper>
      </Modal>
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
  padding: 1.5rem;
`;

const ControlsSectionWrapper = styled.div<{ hideBackground?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ hideBackground }) => hideBackground ? 'transparent' : 'rgba(255, 255, 255, 0.7)'};
  padding: 0.5rem;
  border-radius: 0.5rem;
  height: 30px;

  :first-child{
    margin-right: 0.5rem;
  
  }
  :last-child{
    margin-left: 0.5rem;
  
  }
`;

const ControlsWrapper = styled.div`
  border-radius: 0.5rem;
  margin: 0 0.5rem 0.5rem;
  padding: 0.5rem;
  justify-content: space-between;
  display: flex;
  flex-direction: row;
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