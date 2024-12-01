import { useInView } from 'framer-motion'
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
  loadingStartCallback?: () => void
  loadingEndCallback?: (src: string) => void
}

const BlurImage = ({
  blurHash,
  src,
  useSquareImage,
  width,
  height,
  alt,
  loadingStartCallback,
  loadingEndCallback
}: Props) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const startLoadingBlurHash = useInView(imgRef, {
    margin: '0px 0px 500px 0px',
    once: true
  })

  const startLoadingImage = useInView(imgRef, {
    margin: '0px 0px 100px 0px',
    once: true
  })

  const [imgLoaded, setImgLoaded] = useState(false)
  const blurUrl = useBlurhash(
    !imgLoaded && startLoadingBlurHash ? blurHash : null
  )

  const handleOnLoad = useCallback(() => {
    setImgLoaded(true)
    loadingEndCallback?.(src)
  }, [loadingEndCallback, src])

  useEffect(() => {
    if (startLoadingImage) {
      loadingStartCallback?.()
    }
  }, [startLoadingImage, loadingStartCallback])

  return (
    <StyledImage
      $useSquareImage={useSquareImage}
      width={width}
      height={height}
      $blurUrl={blurUrl}
      ref={imgRef}
      {...(startLoadingImage || imgLoaded ? { src } : {})}
      loading={startLoadingImage ? 'eager' : 'lazy'}
      rel={startLoadingImage ? 'preload' : ''}
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

export default BlurImage
