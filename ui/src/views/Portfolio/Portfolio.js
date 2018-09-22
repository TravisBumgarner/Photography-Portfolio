import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { PortfolioWrapper, ProjectDescriptionWrapper } from './Portfolio.styles.js'

class Portfolio extends Component {
    constructor(props) {
        super(props)
        this.state = { filteredPhotos: [], projectDetails: null }
    }
    componentWillMount() {
        const {
            match: {
                params: { projectType, project }
            },
            photos
        } = this.props

        if (projectType === 'singles') {
            this.filterPhotosByYear(photos, project)
        } else if (projectType === 'project') {
            this.filterPhotosByProject(photos, project)
        }
    }

    getProjectDescription = projectTitle => {
        axios
            .get(__API__ + `projects/${projectTitle}`)
            .then(response => {
                const { start_date: startDate, end_date: endDate, description, title } = response.data
                this.setState({ projectDetails: { startDate, endDate, description, title } })
            })
            .catch(error => {
                console.log(error)
            })
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
            this.getProjectDescription(projectTitle)
            this.filterPhotosByProject(photos, projectTitle)
        }
    }

    filterPhotosByYear = (photos, year) => {
        const filteredPhotos = photos.filter(photo => photo.year == year)
        this.setState({ filteredPhotos, projectType: 'project' })
    }

    filterPhotosByProject = (photos, project) => {
        const filteredPhotos = photos.filter(photo => photo.project.id == project)
        this.setState({ filteredPhotos, projectType: 'singles' })
    }

    render() {
        const { filteredPhotos, projectDetails } = this.state
        const { photos } = this.props
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
