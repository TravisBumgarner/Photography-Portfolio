import React from 'react'

import { MediumText } from './Text.styles'
import { any } from 'prop-types'

type Props = {
    children: any
}

const Text = ({ children }: Props) => {
    return <MediumText>{children}</MediumText>
}

export default Text