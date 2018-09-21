import styled from 'styled-components'

import { FaTimes } from 'react-icons/fa'

const CloseIcon = styled(FaTimes)`
    position: absolute;
    right: 0;
    top: 0;
    margin-right: 15px;
    margin-top: 15px;
    z-index: 999;
`

const GalleryWrapper = styled.div`
    display: flex;
    padding: 0;
    margin: 0;
    list-style: none;
    justify-content: space-around;
    flex-wrap: wrap;
    line-height: 30px;
`

const PreviousButton = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: w-resize;
`

const NextButton = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    cursor: e-resize;
`

const PhotoWithMetadataWrapper = styled.div`
    position: relative;
`

const GalleryItem = styled.div`
    margin: 1vw;
    color: white;
    flex: 1 0 auto;
    height: auto;
    flex-basis: 29%;

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
    PreviousButton,
    NextButton,
    PhotoWithMetadataWrapper
}
