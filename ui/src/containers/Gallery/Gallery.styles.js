import styled from 'styled-components'

import { FaTimes, FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'

import { CONTENT_SPACING } from 'Theme'

const CloseIcon = styled(FaTimes)`
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 999;
    fill: #ccc;

    &:hover {
        fill: #000;
    }
`
const ProjectDescriptionWrapper = styled.div`
    margin: ${CONTENT_SPACING / 2}vw 0;
`

const GalleryWrapper = styled.div`
    display: flex;
    padding: 0;
    list-style: none;
    justify-content: space-around;
    flex-wrap: wrap;
    line-height: 30px;
`

const PreviousButton = styled(FaArrowCircleLeft)`
    position: fixed;
    top: calc(50vh - 1.5em);
    left: 20px;
    fill: #ccc;

    &:hover {
        fill: #000;
    }
`
const NextButton = styled(FaArrowCircleRight)`
    position: fixed;
    top: calc(50vh - 1.5em);
    right: 20px;
    fill: #ccc;

    &:hover {
        fill: #000;
    }
`

const PreviousContainer = styled.div`
    position: absolute;
    display: flex;
    left: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: w-resize;
`

const NextContainer = styled.div`
    position: absolute;
    display: flex;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: e-resize;
`

const PhotoWithMetadataWrapper = styled.div`
    background-color: white;
    width: 100vw;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
`

const GalleryItem = styled.div`
    margin: 1vw;
    color: white;
    flex: 1 0 auto;
    height: auto;
    flex-basis: 29%;

    &:nth-child(3n + 1) {
        margin: ${CONTENT_SPACING.m};
        margin-left: 0;
    }

    &:nth-child(3n + 3) {
        margin: ${CONTENT_SPACING.m};
        margin-right: 0;
    }

    &:before {
        content: '';
        float: left;
        padding-top: 100%;
    }
`

export {
    CloseIcon,
    GalleryWrapper,
    GalleryItem,
    PreviousContainer,
    NextContainer,
    PhotoWithMetadataWrapper,
    ProjectDescriptionWrapper,
    PreviousButton,
    NextButton
}
