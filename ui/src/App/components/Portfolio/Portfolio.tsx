import * as React from 'react'

import { GalleryType, PhotoType } from 'sharedTypes'
import { Gallery } from './components'

const ALL_GALLERY: GalleryType = {
    content_type: 'snapshot',
    slug: 'all',
    title: 'All'
}


type Props = {
    match: {
        params: {
            contentType: string
            gallerySlug: string
            photoId: string
        }
    },
    photos: PhotoType[],
    galleries: GalleryType[],
    history: any
}

const Portfolio = (
    {
        match: {
            params: { contentType, gallerySlug, photoId }
        },
        photos,
        galleries,
        history
    }: Props
) => {
    const [filteredPhotos, setFilteredPhotos] = React.useState<PhotoType[]>([])

    const filterPhotos = () => {
        if (contentType === 'snapshot' && gallerySlug === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == 'snapshot')
            setFilteredPhotos(filteredPhotos)
        } else {
            const filteredPhotos = photos.filter(photo => photo.gallery.slug == gallerySlug)
            setFilteredPhotos(filteredPhotos)
        }
    }

    React.useEffect(filterPhotos, [contentType, gallerySlug])

    let galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)
    galleryDetails = galleryDetails || ALL_GALLERY

    return (
        <Gallery
            history={history}
            photoId={photoId}
            photos={filteredPhotos}
            galleryDetails={galleryDetails}
        />
    )
}

export default Portfolio
