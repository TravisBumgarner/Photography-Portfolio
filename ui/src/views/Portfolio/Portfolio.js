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
                params: { contentType, galleryId }
            },
            photos
        } = this.props
        this.filterPhotos(photos, contentType, galleryId)
    }

    componentWillReceiveProps(nextProps) {
        const {
            match: {
                params: { contentType, galleryId }
            },
            photos
        } = nextProps
        this.filterPhotos(photos, contentType, galleryId)
    }

    filterPhotos = (photos, contentType, galleryId) => {
        if (contentType === SNAPSHOT && galleryId === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == SNAPSHOT)
            this.setState({ filteredPhotos })
        } else {
            const filteredPhotos = photos.filter(photo => photo.gallery.id == galleryId)
            this.setState({ filteredPhotos })
        }
    }

    render() {
        const {
            match: {
                params: { galleryId }
            },
            photos,
            galleries
        } = this.props

        const { filteredPhotos } = this.state
        let galleryDetails = galleries.length && galleries.filter(gallery => gallery.id == galleryId)[0]
        galleryDetails = galleryDetails || { title: 'All', description: 'All Snapshots' }
        return photos ? (
            <PortfolioWrapper>
                <Gallery photos={filteredPhotos} galleryDetails={galleryDetails} />
            </PortfolioWrapper>
        ) : (
            <PortfolioWrapper />
        )
    }
}

export default Portfolio
