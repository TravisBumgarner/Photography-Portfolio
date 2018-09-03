import React, { Component } from 'react'
import axios from 'axios'

import { Navigation } from '../../components'

import { HomeWrapper } from './Home.styles.js'

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true
        }
    }

    componentWillMount() {
        axios
            .get('http://localhost:8000/')
            .then(response => {
                // console.log(response)
                this.setState({
                    isLoading: false
                })
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    isLoading: false
                })
            })
    }

    render() {
        const { isLoading } = this.state

        return (
            <HomeWrapper>
                {isLoading ? <p>Loading</p> : <Navigation />}
            </HomeWrapper>
        )
    }
}

Home.propTypes = {}

export default Home
