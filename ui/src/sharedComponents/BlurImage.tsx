import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { useInView } from 'react-intersection-observer'
import { useBlurhash } from '../hooks/useBlurhash'

interface Props {
  blurHash: string
  // style: React.CSSProperties
  src: string
  aspectRatio: number
}

// Uses browser-native `loading="lazy"` to lazy load images
// Renders a blurhash value to a blob when it about to appear on screen.
// Only renders the blurhash when the image hasn't loaded yet.
// Removes the blob once the image has finished loading.

// eslint-disable-next-line
export const BlurImage = ({ blurHash, src }: Props) => {
  const [isVisible, setIsVisible] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  //   const [ref, inView] = useInView({ rootMargin: '110%' })
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

  const newStyle = blurUrl
    ? {
        // ...style,
        backgroundImage: `url("${blurUrl}")`,
        backgroundSize: '100% 100%'
      }
    : {}

  return (
    <img
      ref={imgRef}
      src={src}
      loading="lazy"
      onLoad={handleOnLoad}
      style={newStyle}
    />
  )
}
