import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from '../../containers'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    componentWillMount() {
        const { toggleNavigation } = this.props

        // axios
        //     .get('http://localhost:8000/photos/')
        //     .then(response => {
        //         console.log(response)
        //         this.setState({
        //             isLoading: false,
        //             photos: response.data
        //         })
        //         // toggleNavigation()
        //     })
        //     .catch(error => {
        //         console.log(error)
        //         this.setState({
        //             isLoading: false
        //         })
        //     })
    }

    render() {
        const { shouldDisplayPhotos, photos } = this.props
        console.log(photos)
        return (
            <HomeWrapper>
                <Gallery photos={photos} shouldDisplayPhotos={true} />
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
