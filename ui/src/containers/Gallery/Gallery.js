import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Photo } from '../../components'

import { GalleryWrapper, GalleryItem, GalleryRow } from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
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
        const { shouldDisplayPhotos } = this.props
        const grid = this.generateGrid()
        console.log('shouldDisplayPhotos', shouldDisplayPhotos)
        return (
            <GalleryWrapper shouldDisplayPhotos={shouldDisplayPhotos}>
                {grid}
            </GalleryWrapper>
        )
    }
}

Gallery.propTypes = {
    photos: PropTypes.array.isRequired,
    shouldDisplayPhotos: PropTypes.bool.isRequired
}

export default Gallery
