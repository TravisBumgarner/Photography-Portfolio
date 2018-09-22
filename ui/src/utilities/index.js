import React from 'react'

import { Header, Text } from 'Components'

const parseContent = rawContent => {
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

export { parseContent }
