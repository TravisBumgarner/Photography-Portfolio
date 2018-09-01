import React, { Component } from 'react'

import { Navigation } from '../../components'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    render() {
        return (
            <HomeWrapper>
                <Navigation />
            </HomeWrapper>
        )
    }
}

Home.propTypes = {}

export default Home
