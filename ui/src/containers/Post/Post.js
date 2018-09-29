import React, { Component } from 'react'

import { Header } from 'Components'
import { parseContent } from 'Utilities'

import { PostWrapper } from './Post.styles'

class Post extends Component {
    render() {
        console.log(parseContent)
        const { title, content, date } = this.props
        const parsedContent = parseContent(content)
        return (
            <PostWrapper>
                <Header size="small">{title}</Header>
                {date}
                {parsedContent}
            </PostWrapper>
        )
    }
}

export default Post
