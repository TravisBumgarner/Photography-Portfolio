import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useBlurhash } from '../hooks/useBlurhash'

/* Note to future self - I could not get this to work for aspect ratios that weren't 1:1.
 * Could be worth revisiting in the future.
 **/

interface Props {
  blurHash: string
  src: string
  width?: number
  height?: number
  useSquareImage: boolean
  alt: string
}

export const BlurImage = ({
  blurHash,
  src,
  useSquareImage,
  width,
  height,
  alt
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
      width={width}
      height={height}
      $blurUrl={blurUrl}
      ref={imgRef}
      // Fixes brief flickering of a broken image if using '' here.
      {...(isVisible ? { src } : {})}
      loading="lazy"
      onLoad={handleOnLoad}
      alt={alt}
    />
  )
}

const StyledImage = styled.img<{
  $blurUrl: string | null
  $useSquareImage: boolean
}>`
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  ${props =>
    props.$blurUrl &&
    `
      background-image: url(${props.$blurUrl});
      background-size: contain;
      background-repeat-no-repeat;
  `}

  ${props =>
    props.$useSquareImage
      ? `
      object-fit: cover;
      width: 100%;
      aspect-ratio: 1 / 1;
    `
      : ''}
`
