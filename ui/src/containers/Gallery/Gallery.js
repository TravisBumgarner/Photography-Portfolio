import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import { Thumbnail, PhotoWithMetadata, Header, Text } from 'Components'

import {
    GalleryWrapper,
    GalleryItem,
    PreviousButton,
    NextButton,
    PhotoWithMetadataWrapper,
    CloseIcon,
    ProjectDescriptionWrapper,
    NextContainer,
    PreviousContainer
} from './Gallery.styles'

const ITEMS_PER_ROW = 3

class Gallery extends Component {
    constructor(props) {
        super(props)
        this.myRef = React.createRef()
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.state = {
            photos: props.photos,
            selectedPhotoIndex: null,
            maxPhotoIndex: props.photos.length - 1,
            infiniteScrollImageCount: 15
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.onScroll, false)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, false)
    }

    onScroll = () => {
        const { infiniteScrollImageCount, maxPhotoIndex } = this.state
        const node = this.myRef.current

        if (
            node.clientHeight !== 0 &&
            infiniteScrollImageCount < maxPhotoIndex &&
            window.innerHeight + window.scrollY >= node.clientHeight - 250
        ) {
            this.setState({ infiniteScrollImageCount: (this.state.infiniteScrollImageCount += 12) })
        }
    }

    handleKeyPress(e) {
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
            selectedPhotoIndex: selectedPhotoIndex === 0 ? maxPhotoIndex : selectedPhotoIndex - 1
        })
    }

    getNextPhotoIndex = () => {
        const { maxPhotoIndex, selectedPhotoIndex } = this.state
        this.setState({
            selectedPhotoIndex: selectedPhotoIndex === maxPhotoIndex ? 0 : selectedPhotoIndex + 1
        })
    }

    generateGrid = () => {
        const { photos, infiniteScrollImageCount } = this.state
        const grid = photos.slice(0, infiniteScrollImageCount).map((photo, index) => (
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
        const { galleryDetails } = this.props
        const grid = this.generateGrid()

        return selectedPhotoIndex !== null ? (
            <PhotoWithMetadataWrapper>
                <CloseIcon size="3em" onClick={this.returnToGridView} />
                <PreviousContainer onClick={this.getPreviousPhotoIndex}>
                    <PreviousButton size="3em" />
                </PreviousContainer>
                <NextContainer onClick={this.getNextPhotoIndex}>
                    <NextButton size="3em" />
                </NextContainer>
                <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
            </PhotoWithMetadataWrapper>
        ) : (
            <Fragment>
                {galleryDetails.title !== 'All' && (
                    <ProjectDescriptionWrapper>
                        <Header size="medium">{galleryDetails.title}</Header>
                        <Text>{galleryDetails.description}</Text>
                        <Text>{`${galleryDetails.start_date} - ${galleryDetails.end_date}`}</Text>
                    </ProjectDescriptionWrapper>
                )}
                <GalleryWrapper ref={this.myRef}>{grid}</GalleryWrapper>
            </Fragment>
        )
    }
}

Gallery.propTypes = {
    galleryDetails: PropTypes.object,
    photos: PropTypes.array.isRequired
}

export default Gallery
