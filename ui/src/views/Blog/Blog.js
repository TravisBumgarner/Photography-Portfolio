import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

import { Post } from 'Containers'

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
            this.setState({
                posts: response.data
            })
        })
    }

    render() {
        console.log(this.state)
        const { posts } = this.state

        const Posts = posts.map(post => <Post key={post.id} {...post} />)

        return <BlogWrapper>{Posts}</BlogWrapper>
    }
}

Blog.propTypes = {}

export default Blog