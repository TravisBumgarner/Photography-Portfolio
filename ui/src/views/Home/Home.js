import React, { Component } from 'react'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    constructor(props) {
        super(props)

        this.state = {
            maxBgIndex: 0,
            currentBgIndex: 0
        }
    }

    componentDidMount() {
        const { backgroundPhotos } = this.props
        this.interval = window.setInterval(this.incrementBgIndex, 8000)
        this.getPhotoCycleInfo(backgroundPhotos)
    }

    componentWillReceiveProps(nextProps) {
        this.getPhotoCycleInfo(nextProps.backgroundPhotos)
    }

    componentWillUnmount() {
        window.clearInterval(this.interval)
    }

    getPhotoCycleInfo = photos => {
        const { maxBgIndex } = this.state
        if (maxBgIndex !== photos.length - 1) {
            const maxBgIndex = photos.length - 1

            this.setState({
                maxBgIndex,
                currentBgIndex: Math.floor(Math.random() * maxBgIndex)
            })
        }
    }

    incrementBgIndex = () => {
        const { maxBgIndex, currentBgIndex } = this.state
        if (currentBgIndex === maxBgIndex) {
            this.setState({ currentBgIndex: 0 })
        } else {
            this.setState({ currentBgIndex: this.state.currentBgIndex + 1 })
        }
    }

    render() {
        const { backgroundPhotos } = this.props
        const { currentBgIndex } = this.state

        return <HomeWrapper backgroundImageUrl={backgroundPhotos[currentBgIndex]} />
    }
}

export default Home
