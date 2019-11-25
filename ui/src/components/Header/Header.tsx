import React from 'react'

import { LargeHeader, MediumHeader, SmallHeader, InlineHeader } from './Header.styles'

type Props = { size: string, children: any }

const Header = ({ size, children }: Props) => {
    switch (size) {
        case 'large':
            return <LargeHeader>{children}</LargeHeader>
        case 'medium':
            return <MediumHeader>{children}</MediumHeader>
        case 'small':
            return <SmallHeader>{children}</SmallHeader>
        case 'inline':
            return <InlineHeader>{children}</InlineHeader>
        default:
            return <SmallHeader>{children}</SmallHeader>
    }
}

export default Header
export { Props as HeaderProps }
