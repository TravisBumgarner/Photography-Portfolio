import styled from 'styled-components'

import { CONTENT_SPACING } from 'theme'
const RACE_CONDITION_MAGIC_NUMBER = 100

const ProjectDescriptionWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
`

const GalleryWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
`

const GalleryItem = styled.div`
    position: relative;
    flex-basis: calc(33% - 10px);
    margin: 5px;
    box-sizing: border-box;

    &::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    & > img {
        position: absolute;
        top: 0; left: 0;
        height: 100%;
        width: 100%;
        object-fit: cover;
    }
`

// const PhotoWithMetadataWrapper = styled.div`
//     background-color: white;
//     width: 100vw;
//     position: fixed;
//     left: 0;
//     top: 0;
//     z-index: 999;
//     height: 100vh;
// `

export {
    GalleryWrapper,
    GalleryItem,
    ProjectDescriptionWrapper,
    RACE_CONDITION_MAGIC_NUMBER
}
