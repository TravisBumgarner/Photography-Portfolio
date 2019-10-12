import React, { Component, Fragment } from 'react'

import { Header } from 'Components'
import { SNAPSHOT, PROJECT } from 'Constants'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem,
    IconWrapper
} from './Navigation.styles.js'

class Navigation extends Component {
    render() {
        const { galleries, toggleNavigation, isHomepage } = this.props

        const projectLinks = []
        const snapshotLinks = []

        galleries.sort((a, b) => (a.title > b.title ? 1 : -1)) // Sort galleries alphabetically
        galleries.map(({ id, title, content_type, slug }) => {
            const link = (
                <LinkListItem key={id} onClick={toggleNavigation}>
                    <InternalLink to={`/portfolio/${content_type}/${slug}`}>{title}</InternalLink>
                </LinkListItem>
            )
            if (content_type === PROJECT) {
                projectLinks.push(link)
            } else if (content_type === SNAPSHOT) {
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
                    <InternalLink to={m.route}>{m.title}</InternalLink>
                </LinkListItem>
            )
        })

        const miscSectionContent = [
            { title: 'About', route: '/about' },
            { title: 'Contact', route: '/contact' }
        ]

        const miscLinks = miscSectionContent.map(m => {
            return (
                <LinkListItem key={m.title} onClick={toggleNavigation}>
                    <InternalLink to={m.route}>{m.title}</InternalLink>
                </LinkListItem>
            )
        })

        return (
            <Fragment>
                <NavigationWrapper isHomepage={isHomepage}>
                    <SubNavigationWrapper>
                        <Header size="medium">Main</Header>
                        <ul>{miscLinks}</ul>
                    </SubNavigationWrapper>

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
                        <Header size="medium">Social</Header>
                        <ul>{socialLinks}</ul>
                    </SubNavigationWrapper>
                </NavigationWrapper>
            </Fragment>
        )
    }
}

export default Navigation
