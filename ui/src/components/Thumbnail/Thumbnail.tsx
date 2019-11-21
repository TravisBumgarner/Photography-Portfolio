import React from 'react'

import { ThumbnailWrapper } from './Thumbnail.styles'

const Thumbnail = ({ index, handleSwitchToSelectedPhoto, src }) => {
    return <ThumbnailWrapper src={src} onClick={() => handleSwitchToSelectedPhoto(index)} />
}

export default Thumbnail
