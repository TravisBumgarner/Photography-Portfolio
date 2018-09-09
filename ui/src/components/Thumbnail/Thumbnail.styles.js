import styled from 'styled-components'

const ThumbnailWrapper = styled.div`
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
`

export { ThumbnailWrapper }
