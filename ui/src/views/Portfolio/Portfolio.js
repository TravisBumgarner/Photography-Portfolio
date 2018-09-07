import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { PortfolioWrapper } from './Portfolio.styles.js'

class Portfolio extends Component {
    constructor(props) {
        super(props)
        this.state = { visiblePhotos: [] }
    }

    componentWillReceiveProps(nextProps) {
        console.log(this.props)
        const {
            match: {
                params: { projectType, projectTitle }
            },
            allPhotos
        } = nextProps

        if (projectType === 'singles') {
            console.log('hi')
            this.filterPhotosByYear(allPhotos, projectTitle)
        } else if (projectType === 'project') {
            this.filterPhotosByProject(allPhotos, projectTitle)
        }
    }

    filterPhotosByYear = (photos, year) => {
        const visiblePhotos = photos.filter(photo => photo.year == year)
        this.setState({ visiblePhotos })
    }

    filterPhotosByProject = (photos, project) => {
        const visiblePhotos = photos.filter(
            photo => photo.project.title == project
        )
        this.setState({ visiblePhotos })
    }

    render() {
        const { visiblePhotos } = this.state
        console.log(this.state, this.props)
        return visiblePhotos ? (
            <PortfolioWrapper>
                <Gallery photos={visiblePhotos} />
            </PortfolioWrapper>
        ) : (
            ''
        )
    }
}

Portfolio.propTypes = {
    allPhotos: PropTypes.array.isRequired
}

export default Portfolio
