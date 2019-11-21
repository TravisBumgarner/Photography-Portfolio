import styled, { keyframes } from 'styled-components'
import React from 'react'
import { FaCamera, FaExclamationTriangle } from 'react-icons/fa'

import { MEDIA, CONTENT_SPACING } from 'Theme'

const StyledPhoto = styled.img`
    max-width: 100%;
    max-height: 95%;
    ${props => (props.isLoading ? 'display: none' : '')};
`

const colorChange = keyframes`
  0% {
    fill: #fff;
  }

  50% {
    fill: rgb(74, 207, 160);
  }

  100% {
      fill: #fff;
  }
`

const LoadingIcon = styled(FaCamera)`
    animation: ${colorChange} 2s linear infinite;
    position: fixed;
    top: calc(50vh - 2.5em);
    left: calc(50vw - 2.5em);
    ${props => (props.isLoading ? '' : 'display: none')};
`

const PhotoWithMetadataWrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 0;
    height: 100vh;
    box-sizing: border-box;
`

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
    padding: 0 20px;
    display: inline-block;
    font-weight: 700;
`

const PhotoWrapper = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-sizing: border-box;
    margin: 0;

    ${MEDIA.phone`
        height: 100%;
        margin: 0 ${CONTENT_SPACING.m};
    `};
`

const MetadataWrapper = styled.div`
    width: 100%;
    height: 10%;
    text-align: center;
    ${MEDIA.phone`
        display: none;
    `};
`

export { StyledPhoto, MetadataWrapper, PhotoWrapper, PhotoWithMetadataWrapper, Spacer, LoadingIcon }
