import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { PortfolioWrapper, ProjectDescriptionWrapper } from './Portfolio.styles.js'

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
                params: { contentType, galleryId }
            },
            photos,
            galleries
        } = this.props

        const { filteredPhotos } = this.state
        const galleryDetails = galleries[0]
        console.log('gallerydetails in portfoli', galleryDetails)
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
