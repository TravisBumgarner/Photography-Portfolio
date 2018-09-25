import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { PortfolioWrapper, ContentWrapper } from './Portfolio.styles.js'

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
        if (contentType === 'snapshots' && galleryId === 'all') {
            const filteredPhotos = photos.filter(photo => photo.gallery.content_type == 'snapshots')
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

Portfolio.propTypes = {
    photos: PropTypes.array.isRequired
}

export default Portfolio
