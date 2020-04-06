import React from 'react'

import { ThumbnailWrapper } from './Thumbnail.styles'

type Props = {
    index: number
    handleSwitchToSelectedPhoto: (selectedPhotoIndex: number | undefined) => void
    src: string
}

const Thumbnail = ({ index, handleSwitchToSelectedPhoto, src }: Props) => {
    return <ThumbnailWrapper src={`https://storage.googleapis.com/photo21/photos/${src}`} onClick={() => handleSwitchToSelectedPhoto(index)} />
}

export default Thumbnail
