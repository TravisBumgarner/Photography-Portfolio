import React, { Component, Fragment } from 'react'

import { Gallery } from 'Containers'
import { SNAPSHOT } from 'Constants'

import { PortfolioWrapper } from './Portfolio.styles.js'

const ALL_GALLERY = {
    content_type: SNAPSHOT,
    slug: 'all',
    title: 'All',
    description: 'All Snapshots'
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
