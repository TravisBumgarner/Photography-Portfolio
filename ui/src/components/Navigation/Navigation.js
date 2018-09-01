import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'

import { Header } from '../../components'

import { NavigationWrapper } from './Navigation.styles.js'

const mainSectionLinks = [
    { title: 'Home', route: '/' },
    { title: 'About', route: '/about' },
    { title: 'Contact', route: '/contact' }
]

class Navigation extends Component {
    render() {
        const mainSectionLinksElements = mainSectionLinks.map(item => {
            return (
                <NavLink key={item.title} to={item.route}>
                    <li>{item.title}</li>
                </NavLink>
            )
        })

        return (
            <NavigationWrapper>
                <Header size="large">Main</Header>
                <ul>{mainSectionLinksElements}</ul>

                <Header size="large">Main</Header>
                <ul>{mainSectionLinksElements}</ul>
            </NavigationWrapper>
        )
    }
}

Navigation.propTypes = {}

export default Navigation
