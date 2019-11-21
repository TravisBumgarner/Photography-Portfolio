import React from 'react'

import { LargeHeader, MediumHeader, SmallHeader, InlineHeader } from './Header.styles.js'

const Header = ({size, children, className}) => {
    switch (size) {
        case 'large':
            return <LargeHeader className={className}>{children}</LargeHeader>
        case 'medium':
            return <MediumHeader className={className}>{children}</MediumHeader>
        case 'small':
            return <SmallHeader className={className}>{children}</SmallHeader>
        case 'inline':
            return <InlineHeader className={className}>{children}</InlineHeader>
        default:
            return <SmallHeader className={className}>{children}</SmallHeader>
    }
}

export default Header
