import React from 'react'
import styled from 'styled-components'

import { GalleryType, PhotoType } from 'sharedTypes'
import { Gallery } from './components'
import { PAGE_THEME } from 'theme'

const ALL_GALLERY: GalleryType = {
    content_type: 'snapshot',
    slug: 'all',
    title: 'All'
}

const PortfolioWrapper = styled(PAGE_THEME)``

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
        <PortfolioWrapper>
            <Gallery
                history={history}
                photoId={photoId}
                photos={filteredPhotos}
                galleryDetails={galleryDetails}
            />
        </PortfolioWrapper>
    )
}

export default Portfolio
