import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from 'Containers'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    render() {
        const { shouldDisplayPhotos, photos } = this.props
        console.log(photos)
        return (
            <HomeWrapper>
                <Gallery
                    photos={photos}
                    shouldDisplayPhotos={shouldDisplayPhotos}
                />
            </HomeWrapper>
        )
    }
}

Home.propTypes = {
    toggleNavigation: PropTypes.func.isRequired,
    shouldDisplayPhotos: PropTypes.bool.isRequired,
    photos: PropTypes.array.isRequired
}

export default Home
