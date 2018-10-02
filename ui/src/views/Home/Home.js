import React, { Component, Fragment } from 'react'

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
        this.interval = window.setInterval(this.incrementBgIndex, 4000)
    }

    componentWillReceiveProps(nextProps) {
        const maxBgIndex = nextProps.backgroundImages.length - 1

        this.setState({
            maxBgIndex,
            currentBgIndex: Math.floor(Math.random() * maxBgIndex)
        })
    }

    componentWillUnmount() {
        window.clearInterval(this.interval)
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
        const { backgroundImages } = this.props
        const { currentBgIndex } = this.state

        return (
            <HomeWrapper>
                <img src={backgroundImages[currentBgIndex]} />
            </HomeWrapper>
        )
    }
}

export default Home
