import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

// import { Posts } from 'Containers'

import { BlogWrapper } from './Blog.styles.js'

class Blog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            posts: []
        }
    }

    componentDidMount() {
        this.getPosts()
    }

    getPosts = () => {
        axios.get('http://localhost:8000/posts').then(response => {
            const { posts } = response.data
            console.log(response.data)
            this.setState({
                posts
            })
        })
    }

    render() {
        const { posts } = this.state
        return photos ? <BlogWrapper>{posts}</BlogWrapper> : <BlogWrapper />
    }
}

Blog.propTypes = {}

export default Blog
