import * as React from 'react'
import styled from 'styled-components'

const ThumbnailWrapper = styled.div`
    background-image: url(${({ src }: { src: string }) => src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
`

type Props = {
    index: number
    handleSwitchToSelectedPhoto: (selectedPhotoIndex: number | undefined) => void
    src: string
}

const Thumbnail = ({ index, handleSwitchToSelectedPhoto, src }: Props) => {
    return <ThumbnailWrapper src={`https://storage.googleapis.com/photo21/photos/thumbnail/${src}`} onClick={() => handleSwitchToSelectedPhoto(index)} />
}

export default Thumbnail
