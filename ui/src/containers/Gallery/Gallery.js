import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Photo } from '../../components'

import { GalleryWrapper, GalleryItem, GalleryRow } from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
    constructor(props) {
        super(props)
        this.state = { width: 0, height: 0 }
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    }

    componentDidMount() {
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions)
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    generateGrid = () => {
        const { photos } = this.props

        const grid = photos.map(photo => (
            <GalleryItem>
                <Photo src={photo.src} />
            </GalleryItem>
        ))

        while (grid.length % ITEMS_PER_ROW !== 0) {
            grid.push(<GalleryItem />)
        }

        return grid
    }

    render() {
        const grid = this.generateGrid()

        return <GalleryWrapper>{grid}</GalleryWrapper>
    }
}

Gallery.propTypes = {
    photos: PropTypes.array.isRequired
}

export default Gallery
