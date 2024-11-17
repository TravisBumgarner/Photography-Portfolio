import React, { useRef, useState } from 'react'
import { BlurhashCanvas } from 'react-blurhash'
import styled from 'styled-components'

const LazyImage = ({ url, blurHash }: { url: string; blurHash: string }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  return (
    <ImageWrapper ref={imageRef}>
      {!isLoaded && (
        <BlurhashCanvas hash={blurHash} width={500} height={500} punch={1} />
      )}
      <Image
        src={url}
        onLoad={() => {
          setIsLoaded(true)
        }}
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
    </ImageWrapper>
  )
}

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
`

export default LazyImage
