import styled from 'styled-components'

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

const PhotoWrapper = styled.div`
    width: 100%;
    height: 90%;
`

const MetadataWrapper = styled.div`
    width: 100%;
    height: 10%;
    text-align: center;
    display: flex;
    justify-content: space-around;
`

export { StyledPhoto, MetadataWrapper, PhotoWrapper, PhotoWithMetadataWrapper }
