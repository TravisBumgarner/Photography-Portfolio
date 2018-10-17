import React, { Component, Fragment } from 'react'

import { Gallery } from 'Containers'
import { SNAPSHOT, PROJECT } from 'Constants'

import { PortfolioWrapper } from './Portfolio.styles.js'

class Portfolio extends Component {
    constructor(props) {
        super(props)
        this.state = { filteredPhotos: [] }
    }
    componentWillMount() {
        const {
            match: {
                params: { contentType, gallerySlug }
            },
            photos
        } = this.props
        this.filterPhotos(photos, contentType, gallerySlug)
    }

    componentWillReceiveProps(nextProps) {
        const {
            match: {
                params: { contentType, gallerySlug }
            },
            photos
        } = nextProps
        this.filterPhotos(photos, contentType, gallerySlug)
    }

    filterPhotos = (photos, contentType, gallerySlug) => {
        if (contentType === SNAPSHOT && gallerySlug === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == SNAPSHOT)
            this.setState({ filteredPhotos })
        } else {
            const filteredPhotos = photos.filter(photo => photo.gallery.title == gallerySlug)
            this.setState({ filteredPhotos })
        }
    }

    render() {
        const {
            match: {
                params: { gallerySlug, photoId }
            },
            photos,
            galleries,
            history
        } = this.props

        const { filteredPhotos } = this.state
        let galleryDetails = galleries.length && galleries.filter(gallery => gallery.slug == gallerySlug)[0]
        galleryDetails = galleryDetails || { title: 'All', description: 'All Snapshots' }
        return photos ? (
            <PortfolioWrapper>
                <Gallery history={history} photoId={photoId} photos={filteredPhotos} galleryDetails={galleryDetails} />
            </PortfolioWrapper>
        ) : (
            <PortfolioWrapper />
        )
    }
}

export default Portfolio
