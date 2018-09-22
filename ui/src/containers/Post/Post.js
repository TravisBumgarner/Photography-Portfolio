import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header, Text, Photo } from 'Components'
import { parseContent } from 'Utilities'

import { PostWrapper } from './Post.styles'

class Post extends Component {
    render() {
        console.log(parseContent)
        const { title, content, date } = this.props
        const parsedContent = parseContent(content)
        return (
            <PostWrapper>
                <Header size="medium">{title}</Header>
                <Header size="small">{date}</Header>
                {parsedContent}
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
