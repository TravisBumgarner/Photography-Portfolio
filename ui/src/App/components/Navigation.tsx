import React, { ReactElement, useContext } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Header } from 'sharedComponents'
import { CONTENT_SPACING, FONT_FAMILY_HEADER, TEXT_FONT_SIZES } from 'theme'
import { context } from '../context'

type Props = {
  toggleNavigation: () => void
}

const Navigation = ({ toggleNavigation }: Props) => {
  const { state: { galleries } } = useContext(context)

  const links: ReactElement[] = []

  Object
    .values(galleries)
    .sort((a, b) => (a.title > b.title ? 1 : -1))
    .map(({ title, slug }) => {
      const link = (
        <LinkListItem key={slug} onClick={toggleNavigation}>
          <InternalLink to={`/${slug}`}>{title}</InternalLink>
        </LinkListItem>
      )
      links.push(link)
    })

  const socialSectionContent = [
    {
      title: 'Awards & Recognition',
      route: '/about',
      external: false
    },
    {
      title: 'Instagram',
      route: 'https://www.instagram.com/cameracoffeewander/',
      external: true,
    },
    {
      title: 'Connect',
      route: 'https://www.linkedin.com/in/travisbumgarner/',
      external: true,
    },
    {
      title: 'Engineering & Blog',
      route: 'https://travisbumgarner.com/',
      external: true,
    },
  ]

  const socialLinks = socialSectionContent.map(m => {
    return (
      <LinkListItem key={m.title} onClick={toggleNavigation}>
        <ExternalLink target={m.external ? "_blank" : ''} href={m.route}>{m.title}</ExternalLink>
      </LinkListItem>
    )
  })

  return (
    <NavigationWrapper>
      <SubNavigationWrapper>
        <Header size="medium">Galleries</Header>
        <ul>{links}</ul>
      </SubNavigationWrapper>

      <SubNavigationWrapper>
        <Header size="medium">Misc</Header>
        <ul>
          {socialLinks}
        </ul>
      </SubNavigationWrapper>
    </NavigationWrapper>
  )
}


const NavigationWrapper = styled.div`
    text-align: right;
    z-index: 999;
    padding: ${CONTENT_SPACING.l};
    border-left: 5px solid black;
    height: 100vh;
    box-sizing: border-box;
    flex-direction: column;
    width: 350px;
    background-color: rgba(255, 255, 255, 1);
    overflow: auto;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;

    :last-child {
        margin-top: 2rem;
    }
`

const LinkListItem = styled.li`
    margin: ${CONTENT_SPACING.s} 0;

    &:hover {
        border-left: 5px solid rgb(74, 207, 160);
    }
`

const sharedStyles = css`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-size: ${TEXT_FONT_SIZES.m};
    color: black;
    width: 100%;
    display: inline-block;

    &:visited {
        color: black;
    }
`

const InternalLink = styled(Link)`
    ${sharedStyles}
`

const ExternalLink = styled.a`
    ${sharedStyles}
`


export default Navigation
