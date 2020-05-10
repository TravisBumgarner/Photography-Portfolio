import React from 'react'
import { Link } from 'react-router-dom'

import { Header } from 'sharedComponents'
import styled, { css } from 'styled-components'
import { FONT_FAMILY_HEADER, CONTENT_SPACING, TEXT_FONT_SIZES } from 'theme'
import { GalleryType } from 'sharedTypes'

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
    overflow: scroll;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
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

type Props = {
    galleries: GalleryType[],
    toggleNavigation: () => void
}

const Navigation = ({ galleries, toggleNavigation }: Props) => {
    const projectLinks: React.ReactElement[] = []
    const snapshotLinks: React.ReactElement[] = []

    galleries.sort((a, b) => (a.title > b.title ? 1 : -1))
    galleries.map(({ title, content_type, slug }) => {
        const link = (
            <LinkListItem key={slug} onClick={toggleNavigation}>
                <InternalLink to={`/portfolio/${content_type}/${slug}`}>{title}</InternalLink>
            </LinkListItem>
        )
        if (content_type.toLowerCase() === 'project') {
            projectLinks.push(link)
        } else if (content_type.toLowerCase() === 'snapshot') {
            snapshotLinks.push(link)
        }
    })

    const socialSectionContent = [
        {
            title: 'LinkedIn',
            route: 'https://www.linkedin.com/in/travisbumgarner/',
        },
        {
            title: 'Instagram',
            route: 'https://www.instagram.com/esafoto/',
        },
        {
            title: 'NatGeo',
            route: 'https://yourshot.nationalgeographic.com/profile/778640/',
        },
        {
            title: 'Flickr',
            route: 'https://www.flickr.com/people/esa_foto/',
        }
    ]

    const socialLinks = socialSectionContent.map(m => {
        return (
            <LinkListItem key={m.title} onClick={toggleNavigation}>
                <ExternalLink href={m.route}>{m.title}</ExternalLink>
            </LinkListItem>
        )
    })

    return (
        <NavigationWrapper>
            <SubNavigationWrapper>
                <Header size="medium">Photo Essays</Header>
                <ul>{projectLinks}</ul>
            </SubNavigationWrapper>

            <SubNavigationWrapper>
                <Header size="medium">Snapshots</Header>
                <ul>
                    <LinkListItem key={'all'} onClick={toggleNavigation}>
                        <InternalLink to={`/portfolio/snapshot/all`}>All</InternalLink>
                    </LinkListItem>
                    {snapshotLinks}
                </ul>
            </SubNavigationWrapper>

            <SubNavigationWrapper>
                <Header size="medium">Connect</Header>
                <ul>
                    <LinkListItem key="about" onClick={toggleNavigation}>
                        <InternalLink to="/about">About</InternalLink>
                    </LinkListItem>
                    {socialLinks}
                </ul>
            </SubNavigationWrapper>
        </NavigationWrapper>
    )
}

export default Navigation
