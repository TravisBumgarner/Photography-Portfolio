import React, { SetStateAction, useMemo } from "react";
import styled from 'styled-components';

import { Header } from "sharedComponents";
import { GalleryType, PhotoType } from "types";
import { getPhotoUrl } from '../../../utils';

type Props = {
  galleryDetails: GalleryType
  photos: { [id: string]: PhotoType }
  filteredPhotoIds: string[]
  setSelectedFilteredPhotoIndex: (value: SetStateAction<number>) => void
  privateGallery: boolean
};

const Gallery = ({ photos, filteredPhotoIds, galleryDetails, setSelectedFilteredPhotoIndex, privateGallery }: Props) => {
  const Photos = useMemo(() => {
    return filteredPhotoIds.map(id => photos[id]).map((photo, index) => {
      const url = getPhotoUrl({ isThumbnail: true, photoSrc: photo.src, privateGalleryId: privateGallery ? photo.gallery : undefined })
      return (
        <Image id={photo.id} style={{ backgroundImage: `url(${url})` }} key={photo.id} onClick={() => setSelectedFilteredPhotoIndex(index)} />
      )
    })
  }, [filteredPhotoIds, photos, setSelectedFilteredPhotoIndex, privateGallery])


  return (
    <>
      <ProjectDescriptionWrapper>
        <Header size="medium">{galleryDetails.title}</Header>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>{Photos}</GalleryWrapper>
    </>
  )
};

const ProjectDescriptionWrapper = styled.div`
    margin: 1rem;
`

const Image = styled.div`
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    padding-bottom: 100%;
    cursor: pointer;
`;

const GalleryWrapper = styled.div`
display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem;
`


export default Gallery;