import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import axios from 'axios'

import { Home } from '../../views'

import { AppWrapper } from './App.styles.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            src: ''
        }
    }

    componentWillMount() {
        axios.get('http://localhost:8000/get_random_image').then(response => {
            this.setState({ src: response.data.src })
        })
    }

    render() {
        const { src } = this.state
        console.log(src)
        return (
            <AppWrapper src={src}>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route component={Home} />
                </Switch>
            </AppWrapper>
        )
    }
}

App.propTypes = {}

export default App
