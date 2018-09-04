import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Gallery } from '../../containers'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            photos: []
        }
    }

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
        const { shouldDisplayImages } = this.props
        const { isLoading, photos } = this.state

        return (
            <HomeWrapper>
                {isLoading ? (
                    <p>One sec...</p>
                ) : (
                    <Fragment>
                        <Gallery
                            photos={photos}
                            shouldDisplayImages={shouldDisplayImages}
                        />
                    </Fragment>
                )}
            </HomeWrapper>
        )
    }
}

Home.propTypes = {
    toggleNavigation: PropTypes.func.isRequired,
    shouldDisplayImages: PropTypes.bool.isRequired
}

export default Home
