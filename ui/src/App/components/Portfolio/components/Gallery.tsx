import React, { useEffect, RefObject, Dispatch, SetStateAction } from "react";
import styled from 'styled-components'

import { Header } from "sharedComponents";
import { PhotoType, GalleryType } from "types";

import { CONTENT_SPACING } from 'theme'

const ProjectDescriptionWrapper = styled.div`
    margin: 1rem;
`

const Image = styled.img`
    width: 100%;
    margin-bottom: 1rem;
    cursor: pointer;
`

const GalleryWrapper = styled.div`
    column-count: 3;
    margin: 1rem;
    column-gap: 1rem;
`


type Props = {
    galleryDetails: GalleryType
    photos: { [id: string]: PhotoType }
    filteredPhotoIds: string[]
    setSelectedFilteredPhotoIndex: (value: SetStateAction<number>) => void
};

const Gallery = ({ photos, filteredPhotoIds, galleryDetails, setSelectedFilteredPhotoIndex }: Props) => {
    return (
        <>
            <ProjectDescriptionWrapper>
                <Header size="medium">{galleryDetails.title}</Header>
            </ProjectDescriptionWrapper>
            <GalleryWrapper>{
                filteredPhotoIds.map(id => photos[id]).map((photo, index) => {
                    return (
                        <Image key={photo.id} src={`https://storage.googleapis.com/photo21-asdqwd/photos/thumbnail/${photo.src}`} onClick={() => setSelectedFilteredPhotoIndex(index)} />
                    )
                })
            }</GalleryWrapper>
        </>
    )
};

export default Gallery;