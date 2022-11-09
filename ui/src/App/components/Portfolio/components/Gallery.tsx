import React, { useEffect, RefObject } from "react";
import styled from 'styled-components'

import { Header } from "sharedComponents";
import { PhotoType, GalleryType } from "types";

import { CONTENT_SPACING } from 'theme'

const ProjectDescriptionWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
`

const GalleryWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
`

const GalleryItem = styled.div`
    position: relative;
    flex-basis: calc(100% / 3 - 10px);
    margin: 7.5px;
    box-sizing: border-box;
    cursor: pointer;

    &:nth-child(3n){
      margin-right: 0;
    }

    &:nth-child(3n + 1){
      margin-left: 0;
    }

    &::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    & > img {
        position: absolute;
        top: 0; left: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
`

type Props = {
    galleryDetails: GalleryType
    photos: { [id: string]: PhotoType }
    filteredPhotoIds: string[]
    setSelectedFilteredPhotoIndex: any
    scrollToPhotoId: number
    elementsRef: RefObject<any>[]
};

const Gallery = ({ photos, filteredPhotoIds, galleryDetails, setSelectedFilteredPhotoIndex, scrollToPhotoId, elementsRef }: Props) => {
    useEffect(() => {
        if (elementsRef.length > 0 && scrollToPhotoId !== undefined) {
            elementsRef[scrollToPhotoId].current.scrollIntoView(true)
        }
    }, [elementsRef.length])

    return (
        <>
            <ProjectDescriptionWrapper>
                <Header size="medium">{galleryDetails.title}</Header>
            </ProjectDescriptionWrapper>
            <GalleryWrapper>{
                filteredPhotoIds.map(id => photos[id]).map((photo, index) => {
                    return (<GalleryItem key={photo.id} id={photo.id} ref={elementsRef[index]}>
                        <img src={`https://storage.googleapis.com/photo21-asdqwd/photos/thumbnail/${photo.src}`} onClick={() => setSelectedFilteredPhotoIndex(index)} />
                    </GalleryItem>)
                })
            }</GalleryWrapper>
        </>
    )
};

export default Gallery;
