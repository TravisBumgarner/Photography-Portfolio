import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { Theme } from '../../views/App/App'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    SiteLink,
    LinkListItem
} from './Navigation.styles.js'

class Navigation extends Component {
    render() {
        const { metadata } = this.props

        const projectsLinks = metadata.projects.map(project => {
            return (
                <LinkListItem key={project}>
                    <SiteLink to={`/portfolio/project/${project}`}>
                        {project}
                    </SiteLink>
                </LinkListItem>
            )
        })

        const yearsLinks = metadata.years.map(year => {
            return (
                <LinkListItem key={year}>
                    <SiteLink to={`/portfolio/singles/${year}`}>
                        {year}
                    </SiteLink>
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
                    <SiteLink to={m.route}>{m.title}</SiteLink>
                </LinkListItem>
            )
        })

        return (
            <NavigationWrapper>
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
                    <Header size="medium">Singles</Header>
                    <ul>{yearsLinks}</ul>
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
    metadata: PropTypes.object.isRequired
}

export default Navigation
