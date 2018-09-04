import styled from 'styled-components'

const GalleryWrapper = styled.div`
    padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    line-height: 30px;
`

const GalleryRow = styled.div`
    /* padding: 0;
    margin: 0;
    list-style: none;
    display: flex;
    justify-content: space-around;
    line-height: 30px; */
`

const GalleryItem = styled.div`
    margin: 5px;
    color: white;
    flex: 1 0 auto;
    height: auto;
    flex-basis: 31%;

    &:before {
        content: '';
        float: left;
        padding-top: 100%;
    }
`

export { GalleryWrapper, GalleryItem, GalleryRow }
