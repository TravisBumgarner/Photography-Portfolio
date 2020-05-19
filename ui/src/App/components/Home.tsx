import React from 'react'
import styled from 'styled-components'

import { useInterval } from 'utilities'
import { PhotoType } from 'sharedTypes'
import { PAGE_THEME } from 'theme'

const HomeWrapper = styled(PAGE_THEME)`
`

const HomeImage = styled.img`
    width: 100%;
`

type Props = {
    backgroundPhotos: PhotoType[]
}

const Home = ({ backgroundPhotos }: Props) => {
    const [backgroundImageIndex, setBackgroundImageIndex] = React.useState(0)

    useInterval(() => setBackgroundImageIndex(backgroundImageIndex + 1), 4000);

    return <HomeWrapper>
        <HomeImage src={backgroundPhotos.length
                ? `https://storage.googleapis.com/photo21/photos/large/${backgroundPhotos[backgroundImageIndex % backgroundPhotos.length].src}`
                : ''}
        />
    </HomeWrapper>
}

export default Home
