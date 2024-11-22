import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useBlurhash } from '../hooks/useBlurhash'

const TRANSPARENT_PIXEL_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

/* Note to future self - I could not get this to work for aspect ratios that weren't 1:1.
 * Could be worth revisiting in the future.
 **/

interface Props {
  blurHash: string
  src: string
  width?: number
  height?: number
  useSquareImage: boolean
}

export const BlurImage = ({
  blurHash,
  src,
  useSquareImage,
  width,
  height
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
      src={isVisible ? src : TRANSPARENT_PIXEL_IMAGE}
      loading="lazy"
      onLoad={handleOnLoad}
    />
  )
}

const StyledImage = styled.img<{
  $blurUrl: string | null
  $useSquareImage: boolean
}>`
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
      aspect-ratio: 1 / 1; /* This maintains a 1:1 aspect ratio */
    `
      : `
    `}
`
