import React, { Component, Fragment } from 'react'

import { Thumbnail, PhotoWithMetadata, Header, Text } from 'Components'
import { ICON_FONT_SIZES } from 'Theme'
import { parseContent } from 'Utilities'

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
        const { photoId } = this.props
        if (photoId) {
            this.setSelectedPhotoIndex(photoId)
        }
        window.addEventListener('scroll', this.onScroll, false)
    }

    componentWillReceiveProps(nextProps) {
        const { photos } = nextProps
        this.setState({
            photos,
            // selectedPhotoIndex: null,
            maxPhotoIndex: photos.length - 1
        })
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

    returnToGridView = () => {
        this.setState({ selectedPhotoIndex: null })
        window.removeEventListener('keydown', this.handleKeyPress)
    }

    setAsSelectedPhoto = selectedPhotoIndex => {
        this.setSelectedPhotoIndex(selectedPhotoIndex)
        window.addEventListener('keydown', this.handleKeyPress)
    }

    getPreviousPhotoIndex = () => {
        const { maxPhotoIndex, selectedPhotoIndex } = this.state
        this.setState(selectedPhotoIndex === 0 ? maxPhotoIndex : selectedPhotoIndex - 1)
    }

    getNextPhotoIndex = () => {
        const { maxPhotoIndex, selectedPhotoIndex } = this.state
        this.setSelectedPhotoIndex(selectedPhotoIndex === maxPhotoIndex ? 0 : selectedPhotoIndex + 1)
    }

    setSelectedPhotoIndex = selectedPhotoIndex => {
        const { photos } = this.state
        console.log('setphotoindex', selectedPhotoIndex)
        this.setState({ selectedPhotoIndex })
        if (photos.length && selectedPhotoIndex) {
            const {
                gallery: { content_type, slug }
            } = photos[selectedPhotoIndex]
            this.props.history.push(`/portfolio/${content_type}/${slug}/${selectedPhotoIndex}`)
        }
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
                    setAsSelectedPhoto={this.setAsSelectedPhoto}
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

        if (!photos.length) {
            return <p>Loading</p>
        }
        console.log('render', photos[selectedPhotoIndex])

        return selectedPhotoIndex !== null ? (
            <PhotoWithMetadataWrapper>
                <CloseIcon size={ICON_FONT_SIZES.l} onClick={this.returnToGridView} />
                <PreviousContainer onClick={this.getPreviousPhotoIndex}>
                    <PreviousButton size={ICON_FONT_SIZES.l} />
                </PreviousContainer>
                <NextContainer onClick={this.getNextPhotoIndex}>
                    <NextButton size={ICON_FONT_SIZES.l} />
                </NextContainer>
                <PhotoWithMetadata details={photos[selectedPhotoIndex]} />
            </PhotoWithMetadataWrapper>
        ) : (
            <Fragment>
                {galleryDetails.title !== 'All' && (
                    <ProjectDescriptionWrapper>
                        <Header size="medium">{galleryDetails.title}</Header>
                        <Text>{parseContent(galleryDetails.description)}</Text>
                        {galleryDetails.content_type == 'Project' && (
                            <Text>{`${galleryDetails.start_date} - ${galleryDetails.end_date}`}</Text>
                        )}
                    </ProjectDescriptionWrapper>
                )}
                <GalleryWrapper ref={this.myRef}>{grid}</GalleryWrapper>
            </Fragment>
        )
    }
}

export default Gallery
