import { signal } from '@preact/signals-react'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { useSignals } from '@preact/signals-react/runtime'
import { context } from 'src/context'
import usePreventAppScroll from 'src/hooks/usePreventAppScroll'
import { IconButton } from 'src/sharedComponents'
import {
  COLORS,
  CONTENT_SPACING,
  FONT_SIZES,
  TRANSITION_SPEED,
  Z_INDEX
} from 'src/theme'
import { focusFirstSiteElement } from 'src/utils'

export const isNavigationVisible = signal(false)

const ABOUT_CONTENT = [
  {
    title: 'Store',
    route: 'https://travisbumgarner.darkroom.com/',
    external: true
  },
  {
    title: 'Instagram',
    route: 'https://www.instagram.com/cameracoffeewander/',
    external: true
  },
  {
    title: 'Recognition',
    route: '/about',
    external: false
  },
  {
    title: 'Contact',
    route: 'https://www.linkedin.com/in/travisbumgarner/',
    external: true
  }
]

const MISC_CONTENT = [
  {
    title: 'Silly Side Projects',
    route: 'https://sillysideprojects.com/',
    external: true
  },
  {
    title: 'Engineering & Blog',
    route: 'https://travisbumgarner.com/',
    external: true
  }
]

const Navigation = () => {
  useSignals()
  const navigationRef = useRef<HTMLDivElement>(null)
  usePreventAppScroll(isNavigationVisible.value)

  const {
    state: { galleries }
  } = useContext(context)

  const closeNavigation = useCallback(() => {
    isNavigationVisible.value = false
  }, [])

  const links = useMemo(() => {
    return Object.values(galleries)
      .sort((a, b) => (a.title > b.title ? 1 : -1))
      .map(({ title, slug }) => {
        return (
          <LinkListItem key={slug} onClick={closeNavigation}>
            <InternalLink to={`/${slug}`}>{title}</InternalLink>
          </LinkListItem>
        )
      })
  }, [galleries, closeNavigation])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Escape key
      if (event.key === 'Escape' && isNavigationVisible.value) {
        isNavigationVisible.value = false
        return
      }

      // Only handle Tab key if navigation is visible
      if (!isNavigationVisible.value || !navigationRef.current) return

      if (event.key === 'Tab') {
        const focusableElements = navigationRef.current.querySelectorAll(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Set focus on the first gallery link when the navigation is visible
  // Clear focus when the navigation is hidden
  useEffect(() => {
    if (isNavigationVisible.value && navigationRef.current) {
      const firstGalleryLink = navigationRef.current.querySelector('a')
      firstGalleryLink?.focus()
    } else {
      focusFirstSiteElement()
    }
  }, [])

  const aboutLinks = ABOUT_CONTENT.map(m => {
    const Component: React.ElementType = m.external
      ? ExternalLink
      : InternalLink

    return (
      <LinkListItem key={m.title} onClick={closeNavigation}>
        <Component
          target={m.external ? '_blank' : ''}
          {...(m.external ? { href: m.route } : { to: m.route })}
          rel={m.external ? 'noopener noreferrer' : undefined}
        >
          {m.title}
          {m.external && <VisuallyHidden>(opens in new tab)</VisuallyHidden>}
        </Component>
      </LinkListItem>
    )
  })

  const miscLinks = MISC_CONTENT.map(m => {
    const Component: React.ElementType = m.external
      ? ExternalLink
      : InternalLink

    return (
      <LinkListItem key={m.title} onClick={closeNavigation}>
        <Component
          target={m.external ? '_blank' : ''}
          {...(m.external ? { href: m.route } : { to: m.route })}
          rel={m.external ? 'noopener noreferrer' : undefined}
        >
          {m.title}
          {m.external && <VisuallyHidden>(opens in new tab)</VisuallyHidden>}
        </Component>
      </LinkListItem>
    )
  })

  return (
    <>
      <NavigationWrapper
        $isNavigationVisible={isNavigationVisible.value}
        ref={navigationRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!isNavigationVisible}
      >
        <SectionsWrapper>
          <CloseButtonWrapper>
            <IconButton
              icon="close"
              ariaLabel="Close navigation"
              onClick={closeNavigation}
              size="LARGE"
            />
          </CloseButtonWrapper>
          <Section>
            <Header>GALLERIES</Header>
            <ul>{links}</ul>
          </Section>

          <Section>
            <Header>ABOUT</Header>
            <ul>{aboutLinks}</ul>
          </Section>

          <Section>
            <Header>MISC</Header>
            <ul>{miscLinks}</ul>
          </Section>
        </SectionsWrapper>
      </NavigationWrapper>
      <NavigationGutter
        $isNavigationVisible={isNavigationVisible.value}
        onClick={closeNavigation}
      />
    </>
  )
}

const NavigationGutter = styled.nav<{ $isNavigationVisible: boolean }>`
  transition: opacity ${TRANSITION_SPEED}s, visibility ${TRANSITION_SPEED}s;
  opacity: ${props => (props.$isNavigationVisible ? 1 : 0)};
  visibility: ${props => (props.$isNavigationVisible ? 'visible' : 'hidden')};
  position: fixed;
  left: 0;
  top: 0;
  background-color: color-mix(in srgb, ${COLORS.FOREGROUND} 20%, transparent);
  width: 100vw;
  height: 100vh;
  z-index: ${Z_INDEX.NAVIGATION_GUTTER};
`

const NavigationWrapper = styled.div<{ $isNavigationVisible: boolean }>`
  box-sizing: border-box;
  display: flex;
  position: fixed;
  z-index: ${Z_INDEX.NAVIGATION};
  top: 0;
  overflow: scroll;
  background-color: ${COLORS.BACKGROUND};
  transition: right ${TRANSITION_SPEED}s, visibility ${TRANSITION_SPEED}s;
  visibility: ${({ $isNavigationVisible }) =>
    $isNavigationVisible ? 'visible' : 'hidden'};
  right: ${({ $isNavigationVisible }) =>
    $isNavigationVisible ? '0' : '-100vw'};

  /* box-shadow: -1px 0px 1.5px hsl(0deg 0% 72% / 0),
    -17.4px 0px 26.1px hsl(0deg 0% 72% / 0.53); */
`

const CloseButtonWrapper = styled.div`
  position: absolute;
  top: ${CONTENT_SPACING.XLARGE};
  right: ${CONTENT_SPACING.XLARGE};
`

const SectionsWrapper = styled.div`
  z-index: 999;
  padding: ${CONTENT_SPACING.XLARGE};
  height: 100vh;
  box-sizing: border-box;
  flex-direction: column;
  width: 300px;
  overflow: auto;
`

const Section = styled.section`
  margin-bottom: ${CONTENT_SPACING.XLARGE};
  :last-child {
    margin-top: 0;
  }
`

const LinkListItem = styled.li`
  padding: ${CONTENT_SPACING.SMALL} 0;

  position: relative;
  left: calc(-1 * (${CONTENT_SPACING.MEDIUM} + 5px));
`

const sharedStyles = css`
  border-left: 5px solid transparent;
  padding-left: ${CONTENT_SPACING.MEDIUM};
  font-weight: 300;
  text-decoration: none;
  font-size: ${FONT_SIZES.SMALL};
  color: ${COLORS.FOREGROUND};

  &:visited {
    color: ${COLORS.FOREGROUND};
  }

  @media (hover: hover) {
    &:hover {
      color: ${COLORS.PRIMARY};
      border-left-color: ${COLORS.PRIMARY};
    }
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.PRIMARY};
    outline-offset: 2px;
  }
`

const Header = styled.h2`
  font-weight: 700;
  font-size: ${FONT_SIZES.SMALL};
  margin-bottom: ${CONTENT_SPACING.SMALL};
`

const InternalLink = styled(Link)`
  ${sharedStyles}
`

const ExternalLink = styled.a`
  ${sharedStyles}
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export default Navigation
