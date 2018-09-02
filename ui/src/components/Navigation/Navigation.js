import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

import { Header } from '../../components'

import { NavigationWrapper } from './Navigation.styles.js'

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

const generateLinks = content => {
    return content.map(item => {
        return (
            <NavLink key={item.title} to={item.route}>
                <li>{item.title}</li>
            </NavLink>
        )
    })
}

class Navigation extends Component {
    render() {
        const mainLinks = generateLinks(mainSectionContent)
        const projectsLinks = generateLinks(projectsSectionContent)

        return (
            <NavigationWrapper>
                <Header size="large">Main</Header>
                <ul>{mainLinks}</ul>

                <Header size="large">Projects</Header>
                <ul>{projectsLinks}</ul>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {}

export default Navigation
