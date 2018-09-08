import styled from 'styled-components'

const GalleryWrapper = styled.div`
    display: flex;
    padding: 0;
    margin: 0;
    list-style: none;
    justify-content: space-around;
    flex-wrap: wrap;
    line-height: 30px;
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

export { GalleryWrapper, GalleryItem }
