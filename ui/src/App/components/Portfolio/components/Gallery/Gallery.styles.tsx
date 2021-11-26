import styled from 'styled-components'

import { FaTimes, FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa'

import { CONTENT_SPACING, ICON_COLOR } from 'theme'
const RACE_CONDITION_MAGIC_NUMBER = 100

const CloseIcon = styled(FaTimes)`
    position: fixed;
    right: 20px;
    top: 20px;
    z-index: 999;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`
const ProjectDescriptionWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
`

const GalleryWrapper = styled.div`
    display: flex;
    padding: 0;
    list-style: none;
    justify-content: space-between;
    flex-wrap: wrap;
    line-height: 30px;
`

const PreviousButton = styled(FaArrowCircleLeft)`
    position: fixed;
    top: calc(50vh - 1rem);
    left: 20px;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`
const NextButton = styled(FaArrowCircleRight)`
    position: fixed;
    top: calc(50vh - 1rem);
    right: 20px;
    fill: ${ICON_COLOR.initial};

    &:hover {
        fill: ${ICON_COLOR.hover};
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
    z-index: ${RACE_CONDITION_MAGIC_NUMBER + 2};
`

const NextContainer = styled.div`
    position: absolute;
    display: flex;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: e-resize;
    z-index: ${RACE_CONDITION_MAGIC_NUMBER + 2};
`

const PhotoWithMetadataWrapper = styled.div`
    background-color: white;
    width: 100vw;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    height: 100vh;
`

const GalleryItem = styled.div`
    margin: ${CONTENT_SPACING.m};
    color: white;
    flex: 1 0 auto;
    height: auto;
    flex-basis: 29%;
    max-width: 400px;
    max-height: 400px;

    &:nth-child(3n + 1) {
        margin-left: 0;
    }

    &:nth-child(3n + 3) {
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
    NextButton,
    RACE_CONDITION_MAGIC_NUMBER
}
