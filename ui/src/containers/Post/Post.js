import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header, Text, Photo } from 'Components'

import { PostWrapper } from './Post.styles'

class Post extends Component {
    parseContent = rawContent => {
        const lines = rawContent.match(/[^\r\n]+/g)

        return lines.map(line => {
            const [tag, content] = line.split(/#(.+)/)

            switch (tag) {
                case 'h1':
                    return <Header size="large">{content}</Header>
                    break
                case 'p':
                    return <Text>{content}</Text>
                    break
                case 'img':
                    return <img src={content} />
                default:
                    return <Text>{content}</Text>
            }
        })
    }

    render() {
        const { title, content, date } = this.props
        const parsedContent = this.parseContent(content)
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
