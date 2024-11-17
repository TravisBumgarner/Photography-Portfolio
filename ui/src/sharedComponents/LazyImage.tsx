import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const LazyImage = ({ url }: { url: string }) => {
  const [isVisible, setIsVisible] = useState(false)
  const imageRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px'
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [url])

  return <Image ref={imageRef} url={isVisible ? url : ''} />
}

const Image = styled.div<{ url: string }>`
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  padding-bottom: 100%;
  cursor: pointer;
  background-image: url(${({ url }) => url});
`

export default LazyImage
