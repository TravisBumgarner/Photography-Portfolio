import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Photo } from 'Components'

import { GalleryWrapper, GalleryItem } from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
    generateGrid = () => {
        const { photos } = this.props

        const grid = photos.map(photo => (
            <GalleryItem key={photo.id}>
                <Photo
                    src={photo.src_thumbnail_medium}
                    color1={photo.color_sample_1}
                    color2={photo.color_sample_2}
                />
            </GalleryItem>
        ))

        // Add blank elements so last row of photos is spaced correctly.
        while (grid.length % ITEMS_PER_ROW !== 0) {
            const modulous = grid.length % ITEMS_PER_ROW
            grid.push(<GalleryItem key={`blank${modulous}`} />)
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
