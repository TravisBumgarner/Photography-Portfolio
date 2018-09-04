import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios'

import { Home, Contact } from '../../views'

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

    clearBackground = () => {
        this.setState({ src: '' })
    }

    render() {
        const { src } = this.state
        console.log(src)
        return (
            <AppWrapper src={src}>
                <Switch>
                    <Route exact path="/contact" component={Contact} />
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <Home clearBackground={this.clearBackground} />
                        )}
                    />
                </Switch>
            </AppWrapper>
        )
    }
}

App.propTypes = {}

export default App
