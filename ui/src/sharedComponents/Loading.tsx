import { motion } from 'framer-motion'
import React from 'react'
import { COLORS, Z_INDEX } from 'src/theme'
import styled from 'styled-components'

// const EXIT_DURATION = 1.5

const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  background-color: ${COLORS.BACKGROUND};
  z-index: ${Z_INDEX.LOADING};
`

const Favicon = () => {
  return (
    <FaviconWrapper
      animate={{ transform: 'rotate(360deg)' }}
      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      style={{ fill: COLORS.PRIMARY, width: 100, height: 100 }}
    >
      <FaviconLeft />
      <FaviconRight />
    </FaviconWrapper>
  )
}

const FaviconLeft = styled.div`
  width: 50%;
  height: 100%;
  background-color: ${COLORS.BACKGROUND};
  box-sizing: border-box;
`

const FaviconRight = styled.div`
  width: 50%;
  height: 100%;
  background-color: ${COLORS.PRIMARY};
  box-sizing: border-box;
`

const FaviconWrapper = styled(motion.div)`
  width: 100px;
  height: 100px;
  fill: ${COLORS.PRIMARY};
  border: 12px solid ${COLORS.BACKGROUND};
  display: flex;
  flex-direction: row;
`

const Loading = () => {
  return (
    <LoadingContainer>
      <Favicon />
    </LoadingContainer>
  )
}

export default Loading
