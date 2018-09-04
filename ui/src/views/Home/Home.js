import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Navigation, Gallery } from '../../containers'

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
        const { clearBackground } = this.props

        axios
            .get('http://localhost:8000/photos/')
            .then(response => {
                console.log(response)
                this.setState({
                    isLoading: false,
                    photos: response.data
                })
                clearBackground()
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoading: false
                })
            })
    }

    render() {
        const { isLoading, photos } = this.state

        return (
            <HomeWrapper>
                {isLoading ? (
                    <p>Loading</p>
                ) : (
                    <Fragment>
                        <Navigation />
                        <Gallery photos={photos} />
                    </Fragment>
                )}
            </HomeWrapper>
        )
    }
}

Home.propTypes = {
    clearBackground: PropTypes.func
}

export default Home
