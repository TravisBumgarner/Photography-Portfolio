import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { Theme } from '../../views/App/App'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem
} from './Navigation.styles.js'

class Navigation extends Component {
    render() {
        const { metadata, theme } = this.props

        const projectsLinks = metadata.projects.map(project => {
            return (
                <LinkListItem key={project}>
                    <InternalLink
                        theme={theme}
                        to={`/portfolio/project/${project}`}
                    >
                        {project}
                    </InternalLink>
                </LinkListItem>
            )
        })

        const yearsLinks = metadata.years.map(year => {
            return (
                <LinkListItem key={year}>
                    <InternalLink
                        theme={theme}
                        to={`/portfolio/singles/${year}`}
                    >
                        {year}
                    </InternalLink>
                </LinkListItem>
            )
        })

        const socialSectionContent = [
            { title: 'Instagram', route: 'https://www.instagram.com/esafoto/' },
            {
                title: 'Flickr',
                route: 'https://www.flickr.com/people/esa_foto/'
            },
            {
                title: 'National Geographic',
                route: 'https://yourshot.nationalgeographic.com/profile/778640/'
            }
        ]

        const socialLinks = socialSectionContent.map(m => {
            return (
                <LinkListItem key={m.title}>
                    <ExternalLink theme={theme} href={m.route} target="_blank">
                        {m.title}
                    </ExternalLink>
                </LinkListItem>
            )
        })

        const miscSectionContent = [
            { title: 'About', route: '/about' },
            { title: 'Contact', route: '/contact' }
        ]

        const miscLinks = miscSectionContent.map(m => {
            return (
                <LinkListItem key={m.title}>
                    <InternalLink theme={theme} to={m.route}>
                        {m.title}
                    </InternalLink>
                </LinkListItem>
            )
        })

        return (
            <NavigationWrapper theme={theme}>
                <SubNavigationWrapper>
                    <Header size="large">
                        Travis
                        <br />
                        Bumgarner
                        <br />
                        Photography
                    </Header>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Projects</Header>
                    <ul>{projectsLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Snapshots</Header>
                    <ul>{yearsLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Social</Header>
                    <ul>{socialLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Misc</Header>
                    <ul>{miscLinks}</ul>
                </SubNavigationWrapper>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {
    metadata: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
}

export default Navigation
