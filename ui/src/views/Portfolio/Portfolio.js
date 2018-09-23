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
                params: { contentType, galleryTitle }
            },
            photos
        } = this.props
        if (contentType === 'snapshots') {
            this.filterPhotosByYear(photos, galleryTitle)
        } else if (contentType === 'project') {
            this.filterPhotosByProject(photos, galleryTitle)
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            match: {
                params: { contentType, galleryId }
            },
            photos
        } = nextProps

        if (contentType === 'snapshots') {
            this.filterPhotosByYear(photos, galleryId)
        } else if (contentType === 'project') {
            this.filterPhotosByProject(photos, galleryId)
        }
    }

    filterPhotosByYear = (photos, snapshotsId) => {
        if (snapshotsId === 'all') {
            this.setState({ filteredPhotos: photos })
        } else {
            const filteredPhotos = photos.filter(photo => photo.gallery.id == snapshotsId)
            this.setState({ filteredPhotos })
        }
    }

    filterPhotosByProject = (photos, projectId) => {
        const filteredPhotos = photos.filter(photo => photo.gallery.id == projectId)
        this.setState({ filteredPhotos })
    }

    render() {
        const { filteredPhotos } = this.state
        const { photos } = this.props
        const projectDetails = { title: 'Foo', description: 'Bar' }
        return photos ? (
            <PortfolioWrapper>
                <Gallery photos={filteredPhotos} projectDetails={projectDetails} />
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
