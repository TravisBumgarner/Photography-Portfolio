import React from 'react'

import { ThumbnailWrapper } from './Thumbnail.styles'

type Props = {
    index: number
    handleSwitchToSelectedPhoto: (selectedPhotoIndex: number | undefined) => void
    src: string
}

const Thumbnail = ({ index, handleSwitchToSelectedPhoto, src }: Props) => {
    return <ThumbnailWrapper src={src} onClick={() => handleSwitchToSelectedPhoto(index)} />
}

export default Thumbnail
