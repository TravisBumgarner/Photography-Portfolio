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
}

const Portfolio = (
    {
        match: {
            params: { contentType, gallerySlug, photoIdFromUrl }
        },
        photos,
        galleries,
        history
    }: Props
) => {
    const [filteredPhotoIds, setFilteredPhotoIds] = React.useState<string[]>([])
    const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = React.useState<number | undefined>(undefined);

    const filterPhotoIds = () => {
        const filteredPhotoIds = Object.values(photos)
            .filter(photo => photo.gallery.slug == gallerySlug)
            .map(({ id }) => id)
        setFilteredPhotoIds(filteredPhotoIds)
    }

    React.useEffect(filterPhotoIds, [gallerySlug])

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
