import React, { Component } from 'react'

import { Header, Text } from 'Components'
import { parseContent } from 'Utilities'

import { PostWrapper, TextWrapper, PhotoWrapper, StyledPhoto} from './Post.styles'

class Post extends Component {
    render() {
        const { title, content, date, photo_src } = this.props
        return (
            <PostWrapper>
                <TextWrapper>
                    <Header size="small">{title}</Header>
                    <Text>{date}</Text>
                    {parseContent(content)}
                </TextWrapper>
                <PhotoWrapper>
                    <StyledPhoto src={photo_src}/>
                </PhotoWrapper>
            </PostWrapper>
        )
    }
}

export default Post
