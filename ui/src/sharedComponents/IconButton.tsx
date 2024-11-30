import React, { cloneElement } from 'react'
import {
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaDownload,
  FaTimes
} from 'react-icons/fa'
import { COLORS, FONT_SIZES, TRANSITION_SPEED } from 'src/theme'
import styled, { css } from 'styled-components'

const IconCSS = (color: string) => css`
  fill: ${color};
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      fill: ${color};
    }
  }
`

const StyledFaTimes = styled(FaTimes)<{ color: string }>`
  ${props => IconCSS(props.color)}
`

const StyledFaArrowLeft = styled(FaArrowLeft)<{ color: string }>`
  ${props => IconCSS(props.color)}
`

const StyledFaArrowRight = styled(FaArrowRight)<{ color: string }>`
  ${props => IconCSS(props.color)}
`

const StyledFaBars = styled(FaBars)<{ color: string }>`
  ${props => IconCSS(props.color)}
`

const StyledFaDownload = styled(FaDownload)<{ color: string }>`
  ${props => IconCSS(props.color)}
`

const iconLookup = {
  close: StyledFaTimes,
  arrowLeft: StyledFaArrowLeft,
  arrowRight: StyledFaArrowRight,
  menu: StyledFaBars,
  download: StyledFaDownload
}

interface IconButtonProps {
  icon: keyof typeof iconLookup
  size: keyof typeof FONT_SIZES
  onClick: () => void
  ariaLabel: string
  tabIndex?: number
  role?: string
  color: string // New color prop
}

const IconButton = ({
  icon,
  onClick,
  ariaLabel,
  tabIndex = 0,
  role = 'button',
  size,
  color // Destructure the color prop
}: IconButtonProps) => {
  const IconComponent = iconLookup[icon]

  return (
    <Button
      onClick={onClick}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      role={role}
    >
      {cloneElement(<IconComponent color={color} />, {
        size: FONT_SIZES[size]
      })}
    </Button>
  )
}

const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: fill ${TRANSITION_SPEED}s;

  &:focus-visible {
    outline: 2px solid ${COLORS.PRIMARY};
    outline-offset: 2px;
  }
`

export default IconButton
