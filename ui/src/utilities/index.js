import React from 'react'

import { Header, Text } from 'Components'

const parseContent = rawContent => {
    if (!rawContent) {
        return ''
    }
    const lines = rawContent.match(/[^\r\n]+/g)
    return lines.map((line, index) => {
        const [tag, content] = line.split(/#(.+)/)

        switch (tag) {
            case 'h1':
                return (
                    <Header key={index} size="large">
                        {content}
                    </Header>
                )
                break
            case 'p':
                return <Text key={index}>{content}</Text>
                break
            case 'img':
                return <img key={index} src={content} />
            default:
                return <Text key={index}>{content}</Text>
        }
    })
}

export { parseContent }
