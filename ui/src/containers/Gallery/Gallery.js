import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Thumbnail, Photo } from 'Components'

import { GalleryWrapper, GalleryItem } from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
    constructor(props) {
        super(props)
        this.state = {
            largePhoto: null
        }
    }

    setLargePhoto = id => {
        const { photos } = this.props
        const largePhoto = photos.filter(p => p.id === id)[0]
        this.setState({ largePhoto })
    }

    generateGrid = () => {
        const { photos } = this.props

        const grid = photos.map(photo => (
            <GalleryItem key={photo.id}>
                <Thumbnail
                    src={photo.src_thumbnail_medium}
                    color1={photo.color_sample_1}
                    color2={photo.color_sample_2}
                    id={photo.id}
                    setLargePhoto={this.setLargePhoto}
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
        const { largePhoto } = this.state
        const grid = this.generateGrid()

        return largePhoto ? (
            <Photo src={largePhoto.src} />
        ) : (
            <GalleryWrapper>{grid}</GalleryWrapper>
        )
    }
}

Gallery.propTypes = {
    photos: PropTypes.array.isRequired
}

export default Gallery
