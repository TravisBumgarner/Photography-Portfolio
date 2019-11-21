import React from 'react'

import { useInterval } from 'Utilities'
import { HomeWrapper } from './Home.styles.js'

const Home = ({ backgroundPhotos }) => {
    const [backgroundImageIndex, setBackgroundImageIndex] = React.useState(0)

    useInterval(() => setBackgroundImageIndex(backgroundImageIndex + 1), 4000);

    return <HomeWrapper backgroundImageUrl={backgroundPhotos[backgroundImageIndex % backgroundPhotos.length].src} />
}

export default Home
