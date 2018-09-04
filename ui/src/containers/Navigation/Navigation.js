import React, { Component } from 'react'

import { Header } from '../../components'

import {
    NavigationWrapper,
    SubNavigationWrapper,
    SiteLink,
    LinkListItem
} from './Navigation.styles.js'

const mainSectionContent = [
    { title: 'Home', route: '/' },
    { title: 'About', route: '/about' },
    { title: 'Contact', route: '/contact' }
]

const projectsSectionContent = [
    { title: '2x3x4', route: '/' },
    { title: 'Black & White', route: '/' },
    { title: 'Squares', route: '/' },
    { title: 'Beetles of Mexico', route: '/' },
    { title: '2x3x4', route: '/' }
]

const singlesSectionContent = [
    { title: '2018', route: '/' },
    { title: '2017', route: '/' },
    { title: '2016', route: '/' },
    { title: '2015', route: '/' },
    { title: '2014', route: '/' },
    { title: '2013', route: '/' }
]

const generateLinks = content => {
    return content.map(item => {
        return (
            <LinkListItem>
                <SiteLink key={item.title} to={item.route}>
                    {item.title}
                </SiteLink>
            </LinkListItem>
        )
    })
}

class Navigation extends Component {
    render() {
        const mainLinks = generateLinks(mainSectionContent)
        const projectsLinks = generateLinks(projectsSectionContent)
        const singlesLinks = generateLinks(singlesSectionContent)

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
                    <Header size="medium">Main</Header>
                    <ul>{mainLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Projects</Header>
                    <ul>{projectsLinks}</ul>
                </SubNavigationWrapper>

                <SubNavigationWrapper>
                    <Header size="medium">Singles</Header>
                    <ul>{singlesLinks}</ul>
                </SubNavigationWrapper>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {}

export default Navigation
