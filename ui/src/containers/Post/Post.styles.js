import styled from 'styled-components'

import { FaTimes } from 'react-icons/fa'

import { CONTENT_SPACING, MEDIA } from 'Theme'

const PostWrapper = styled.div`
    margin: 0 0 ${CONTENT_SPACING.xl} 0;
    display: flex;

    ${MEDIA.tablet`
        flex-direction: column-reverse;
    `};
`

const TextWrapper = styled.div`
    width: 50%;

    ${MEDIA.tablet`
        width: 100%;
    `};
`

const PhotoWrapper = styled.div`
    width: 50%;

    ${MEDIA.tablet`
        width: 100%;
    `};
`

const StyledPhoto = styled.img`
    width: 100%;
    box-sizing: border-box;
    padding: ${CONTENT_SPACING.l};

    ${MEDIA.tablet`
        padding: 0;
    `};
`

export { PostWrapper, TextWrapper, PhotoWrapper, StyledPhoto }
