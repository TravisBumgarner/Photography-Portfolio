import React from 'react'

import { GalleryType, PhotoType } from '../App/App.types'
import { PortfolioWrapper } from './Portfolio.styles.js'
import { Gallery } from 'Containers'

const SNAPSHOT = 'snapshot'
const PROJECT = 'project'
const ANALOG = 'analog'
const DIGITAL = 'digital'

const ALL_GALLERY: GalleryType = {
    content_type: SNAPSHOT,
    slug: 'all',
    id: -1,
    title: 'All',
    description: 'All Snapshots',
    start_date: "2017-01-01",
    end_date: "2017-01-01"
}

type Props = {
    match: {
        params: {
            contentType: string
            gallerySlug: string
            photoId: String
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
        if (contentType === SNAPSHOT && gallerySlug === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == SNAPSHOT)
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
