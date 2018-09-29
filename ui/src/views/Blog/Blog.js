import React, { Component, Fragment } from 'react'
import axios from 'axios'

import { Post } from 'Containers'
import { Header } from 'Components'

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
        axios.get(__API__ + 'posts').then(response => {
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

        return (
            <BlogWrapper>
                <Header size="medium">Blog</Header>
                {Posts}
            </BlogWrapper>
        )
    }
}

export default Blog
