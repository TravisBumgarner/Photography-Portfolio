import * as React from 'react'

import { GalleryType, PhotoType } from 'sharedTypes'
import {
    Gallery,
    Photo
} from './components'

type Props = {
    match: {
        params: {
            contentType: string
            gallerySlug: string
            photoIdFromUrl: string
        }
    },
    photos: { [id: string]: PhotoType },
    galleries: GalleryType[],
    history: any
    setIsTitlebarVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const Portfolio = (
    {
        match: {
            params: { contentType, gallerySlug, photoIdFromUrl }
        },
        photos,
        galleries,
        history,
        setIsTitlebarVisible,
    }: Props
) => {
    const [filteredPhotoIds, setFilteredPhotoIds] = React.useState<string[]>([])
    const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = React.useState<number | undefined>(undefined);
    const [initialLoad, setInitialLoad] = React.useState(true)
    // I couldn't figure out a more elegant way to load in photo IDs from the URL on initial load so we have this useState.

    React.useEffect(() => setIsTitlebarVisible(selectedFilteredPhotoIndex === undefined), [selectedFilteredPhotoIndex])

    const filterPhotoIds = () => {
        const filteredPhotoIds = Object.values(photos)
            .filter(photo => photo.gallery.slug == gallerySlug)
            .map(({ id }) => id)
        return filteredPhotoIds
    }
    React.useEffect(() => {
        const filteredPhotoIds = filterPhotoIds()
        if (initialLoad && photoIdFromUrl && selectedFilteredPhotoIndex === undefined) {
            setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoIdFromUrl))
            setInitialLoad(false)
        }
        setFilteredPhotoIds(filteredPhotoIds)
    }, [gallerySlug])

    const handleUrlChange = () => {
        if (initialLoad && photoIdFromUrl && selectedFilteredPhotoIndex === undefined) {
            return
        }
        history.push(
            `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
        )
    };
    React.useEffect(handleUrlChange, [filteredPhotoIds[selectedFilteredPhotoIndex]])


    const galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)
    return selectedFilteredPhotoIndex === undefined
        ? (
            <Gallery
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
                galleryDetails={galleryDetails}
            />
        ) : (
            < Photo
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
            />
        )
}

export default Portfolio
