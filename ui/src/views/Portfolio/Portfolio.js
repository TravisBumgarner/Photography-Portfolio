import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { PortfolioWrapper } from './Portfolio.styles.js'

class Portfolio extends Component {
    constructor(props) {
        super(props)
        this.state = { filteredPhotos: [] }
    }

    componentWillReceiveProps(nextProps) {
        const {
            match: {
                params: { projectType, projectTitle }
            },
            photos
        } = nextProps

        if (projectType === 'singles') {
            this.filterPhotosByYear(photos, projectTitle)
        } else if (projectType === 'project') {
            this.filterPhotosByProject(photos, projectTitle)
        }
    }

    filterPhotosByYear = (photos, year) => {
        const filteredPhotos = photos.filter(photo => photo.year == year)
        this.setState({ filteredPhotos })
    }

    filterPhotosByProject = (photos, project) => {
        const filteredPhotos = photos.filter(
            photo => photo.project.title == project
        )
        this.setState({ filteredPhotos })
    }

    render() {
        const { filteredPhotos } = this.state
        return filteredPhotos ? (
            <PortfolioWrapper>
                <Gallery photos={filteredPhotos} />
            </PortfolioWrapper>
        ) : (
            ''
        )
    }
}

Portfolio.propTypes = {
    photos: PropTypes.array.isRequired
}

export default Portfolio
