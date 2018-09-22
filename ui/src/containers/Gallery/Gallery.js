import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Thumbnail, PhotoWithMetadata } from 'Components'

import {
    GalleryWrapper,
    GalleryItem,
    PreviousButton,
    NextButton,
    PhotoWithMetadataWrapper,
    CloseIcon
} from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
    constructor(props) {
        super(props)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.state = {
            photos: props.photos,
            selectedPhotoIndex: null,
            maxPhotoIndex: 0
        }
    }

    handleKeyPress(e) {
        console.log(e.key)
        if (e.key === 'ArrowLeft') {
            this.getPreviousPhotoIndex()
        } else if (e.key === 'ArrowRight') {
            this.getNextPhotoIndex()
        } else if (e.key === 'Escape') {
            this.returnToGridView()
        }
    }

    componentWillReceiveProps(nextProps) {
        const { photos } = nextProps
        this.setState({
            photos,
            selectedPhotoIndex: null,
            maxPhotoIndex: photos.length - 1
        })
    }

    returnToGridView = () => {
        this.setState({ selectedPhotoIndex: null })
        window.removeEventListener('keydown', this.handleKeyPress)
    }

    setSelectedPhotoIndex = index => {
        this.setState({ selectedPhotoIndex: index })
        window.addEventListener('keydown', this.handleKeyPress)
    }

    getPreviousPhotoIndex = () => {
        const { maxPhotoIndex, selectedPhotoIndex } = this.state
        this.setState({
            selectedPhotoIndex:
                selectedPhotoIndex === 0
                    ? maxPhotoIndex
                    : selectedPhotoIndex - 1
        })
    }

    getNextPhotoIndex = () => {
        const { maxPhotoIndex, selectedPhotoIndex } = this.state
        this.setState({
            selectedPhotoIndex:
                selectedPhotoIndex === maxPhotoIndex
                    ? 0
                    : selectedPhotoIndex + 1
        })
    }

    generateGrid = () => {
        const { photos } = this.state

        const grid = photos.map((photo, index) => (
            <GalleryItem key={photo.id}>
                <Thumbnail
                    src={photo.src_thumbnail_medium}
                    color1={photo.color_sample_1}
                    color2={photo.color_sample_2}
                    index={index}
                    setSelectedPhotoIndex={this.setSelectedPhotoIndex}
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
        const { selectedPhotoIndex, photos } = this.state
        const grid = this.generateGrid()
        return selectedPhotoIndex !== null ? (
            <PhotoWithMetadataWrapper>
                <CloseIcon size="2em" onClick={this.returnToGridView} />
                <PreviousButton onClick={this.getPreviousPhotoIndex} />
                <NextButton onClick={this.getNextPhotoIndex} />
                <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
            </PhotoWithMetadataWrapper>
        ) : (
            <GalleryWrapper>{grid}</GalleryWrapper>
        )
    }
}

Gallery.propTypes = {
    photos: PropTypes.array.isRequired
}

export default Gallery
