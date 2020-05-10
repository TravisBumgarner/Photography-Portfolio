import React from 'react'
import styled from 'styled-components'

import { useInterval } from 'utilities'
import { PhotoType } from 'sharedTypes'
import { PAGE_THEME } from 'theme'

const HomeWrapper = styled(PAGE_THEME)`
    background-image: ${({ backgroundImageUrl }: { backgroundImageUrl: string }) => `url('https://storage.googleapis.com/photo21/photos/large/${backgroundImageUrl}')`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: fixed;
    z-index: 0;
`

type Props = {
    backgroundPhotos: PhotoType[]
}

const Home = ({ backgroundPhotos }: Props) => {
    const [backgroundImageIndex, setBackgroundImageIndex] = React.useState(0)

    useInterval(() => setBackgroundImageIndex(backgroundImageIndex + 1), 4000);

    return <HomeWrapper
        backgroundImageUrl={
            backgroundPhotos.length
                ? backgroundPhotos[backgroundImageIndex % backgroundPhotos.length].src
                : ''
        }
    />
}

export default Home
