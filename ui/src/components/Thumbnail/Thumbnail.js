import React from 'react'

import { ThumbnailWrapper } from './Thumbnail.styles'

const Thumbnail = ({ index, setAsSelectedPhoto, src }) => {
    return <ThumbnailWrapper src={src} onClick={() => setAsSelectedPhoto(index)} />
}

export default Thumbnail
