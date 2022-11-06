import React, { Dispatch, SetStateAction, useState, useEffect, createRef } from 'react'
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { GalleryType, PhotoType } from 'types'
import { Gallery, Photo } from './components'

type Props = {
    photos: { [id: string]: PhotoType },
    galleries: GalleryType[],
    setIsTitlebarVisible: Dispatch<SetStateAction<boolean>>
}

const Portfolio = ({ photos, galleries, setIsTitlebarVisible }: Props
) => {
    const [filteredPhotoIds, setFilteredPhotoIds] = useState<string[]>([])
    const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = useState<number | undefined>(undefined);
    const [initialLoad, setInitialLoad] = useState(true) // Use for Initial Load of photo ID from URL
    const [scrollToPhotoId, setScrollToPhotoId] = useState<number | undefined>(undefined)
    const { gallerySlug, photoId } = useParams<{ contentType: string, gallerySlug: string, photoId: string }>();
    const navigate = useNavigate();

    useEffect(() => setIsTitlebarVisible(selectedFilteredPhotoIndex === undefined), [selectedFilteredPhotoIndex])

    const filterPhotoIds = useCallback(() => {
        const filteredPhotoIds = Object.values(photos)
            .filter(photo => photo.gallery.slug == gallerySlug)
            .sort((a, b) => {
                const aDate = new Date(a.date_taken)
                const bDate = new Date(b.date_taken)
                return bDate.getTime() - aDate.getTime()
            })
            .map(({ id }) => id)
        return filteredPhotoIds
    }, [photos, gallerySlug])

    useEffect(() => {
        const filteredPhotoIds = filterPhotoIds()
        if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
            setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoId))
            setInitialLoad(false)
        }
        setFilteredPhotoIds(filteredPhotoIds)
        setScrollToPhotoId(undefined)
    }, [gallerySlug])

    const scrollingRefs = useMemo(() => {
        return filteredPhotoIds.map(() => createRef())
    }, [filteredPhotoIds])
    const galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)

    const handleUrlChange = useCallback(() => {
        if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
            return
        }
        navigate(
            `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
        )
    }, [initialLoad, photoId, selectedFilteredPhotoIndex, galleryDetails]);

    useEffect(handleUrlChange, [filteredPhotoIds[selectedFilteredPhotoIndex]])

    return selectedFilteredPhotoIndex === undefined
        ? (
            <Gallery
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
                galleryDetails={galleryDetails}
            />
        ) : (
            <Photo
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
            />
        )
}

export default Portfolio
