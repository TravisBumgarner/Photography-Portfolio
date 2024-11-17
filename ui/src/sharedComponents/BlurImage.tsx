import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useBlurhash } from '../hooks/useBlurhash'

interface Props {
  blurHash: string
  // style: React.CSSProperties
  src: string
  aspectRatio: number
  useSquareImage: boolean
}

// Uses browser-native `loading="lazy"` to lazy load images
// Renders a blurhash value to a blob when it about to appear on screen.
// Only renders the blurhash when the image hasn't loaded yet.
// Removes the blob once the image has finished loading.

export const BlurImage = ({
  blurHash,
  src,
  useSquareImage,
  aspectRatio
}: Props) => {
  const [isVisible, setIsVisible] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const blurUrl = useBlurhash(!imgLoaded && isVisible ? blurHash : null)

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

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleOnLoad = useCallback(() => {
    setImgLoaded(true)
  }, [])

  return (
    <StyledImage
      $useSquareImage={useSquareImage}
      $aspectRatio={aspectRatio}
      $blurUrl={blurUrl}
      ref={imgRef}
      src={isVisible ? src : ''}
      loading="lazy"
      onLoad={handleOnLoad}
    />
  )
}

const StyledImage = styled.img<{
  $blurUrl: string | null
  $useSquareImage: boolean
  $aspectRatio: number
}>`
  ${props => (props.$aspectRatio > 1 ? 'width: 100%;' : 'height: 100%;')}
  aspect-ratio: ${props => props.$aspectRatio};

  ${props =>
    props.$blurUrl &&
    `
  background-image: url(${props.$blurUrl});
  background-size: 100% 100%;
  `}

  ${props =>
    props.$useSquareImage &&
    `
      object-fit: cover;
      width: 100%;
      aspect-ratio: 1 / 1; /* This maintains a 1:1 aspect ratio */
    `}
`
