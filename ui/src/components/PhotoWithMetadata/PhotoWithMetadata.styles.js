import styled from 'styled-components'
import React from 'react'

const StyledPhoto = styled.img`
    max-width: 100%;
    max-height: 100%;
`

const PhotoWithMetadataWrapper = styled.div`
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 2vw 0;
    height: 100vh;
    box-sizing: border-box;
`

const Spacer = styled(({ className }) => <span className={className}>//</span>)`
    padding: 0 20px;
    display: inline-block;
    font-weight: 700;
`

const PhotoWrapper = styled.div`
    width: 100%;
    height: 90%;
`

const MetadataWrapper = styled.div`
    width: 100%;
    height: 10%;
    text-align: center;
    /* display: flex;
    justify-content: space-around; */
`

export { StyledPhoto, MetadataWrapper, PhotoWrapper, PhotoWithMetadataWrapper, Spacer }
