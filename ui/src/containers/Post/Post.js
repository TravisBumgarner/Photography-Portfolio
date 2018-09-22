import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header, Text } from 'Components'

import { PostWrapper } from './Post.styles'

class Post extends Component {
    render() {
        const { title, content, date } = this.props

        return (
            <PostWrapper>
                <Header size="medium">{title}</Header>
                <Header size="small">{date}</Header>
                <Text>{content}</Text>
            </PostWrapper>
        )
    }
}

Post.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired
}

export default Post
