import React from 'react'

import { Gallery } from 'Containers'


import { PortfolioWrapper } from './Portfolio.styles.js'

const SNAPSHOT = 'snapshot'
const PROJECT = 'project'
const ANALOG = 'analog'
const DIGITAL = 'digital'

const ALL_GALLERY = {
    content_type: SNAPSHOT,
    slug: 'all',
    title: 'All',
    description: 'All Snapshots',
    start_date: "2017-01-01",
    end_date: "2017-01-01"
}

const Portfolio = (
    { match: {
        params: {contentType, gallerySlug, photoId}
    },
    photos,
    galleries,
    history }
) => {
    const [filteredPhotos, setFilteredPhotos] = React.useState([])

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

    return  (
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
