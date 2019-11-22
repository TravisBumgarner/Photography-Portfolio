import React from 'react'

import { Header, Text } from 'Components'

const parseContent = (rawContent: string) => {
  if (!rawContent) {
    return ''
  }
  const lines = rawContent.match(/[^\r\n]+/g) || []
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


function useInterval(callback: any, delay: number) {
  const savedCallback = React.useRef<any>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export { parseContent, useInterval }
