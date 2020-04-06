import React from 'react'

import { Header } from 'sharedComponents'

const SNAPSHOT = 'snapshot'
const PROJECT = 'project'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    ExternalLink,
    InternalLink,
    LinkListItem,
} from './Navigation.styles'

import { GalleryType } from 'types'

type Props = {
    galleries: GalleryType[],
    toggleNavigation: () => void
}

const Navigation = ({ galleries, toggleNavigation }: Props) => {
    const projectLinks: React.ReactElement[] = []
    const snapshotLinks: React.ReactElement[] = []

    galleries.sort((a, b) => (a.title > b.title ? 1 : -1)) // Sort galleries alphabetically
    galleries.map(({ id, title, content_type, slug }) => {
        const link = (
            <LinkListItem key={id} onClick={toggleNavigation}>
                <InternalLink to={`/portfolio/${content_type}/${slug}`}>{title}</InternalLink>
            </LinkListItem>
        )
        if (content_type.toLowerCase() === PROJECT) {
            projectLinks.push(link)
        } else if (content_type.toLowerCase() === SNAPSHOT) {
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
                        <InternalLink to={`/portfolio/${SNAPSHOT}/all`}>All</InternalLink>
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
