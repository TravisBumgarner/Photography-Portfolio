import React from 'react'

import { LargeHeader, MediumHeader, SmallHeader, InlineHeader } from './Header.styles.js'

type Props = { size: string, children: any, className: string }

const Header = ({ size, children, className }: Props) => {
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
export { Props as HeaderProps }
