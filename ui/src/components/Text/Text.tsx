import React from 'react'

import { MediumText } from './Text.styles.js'

const Text = ({ size, children, inverted }) => {
    return <MediumText inverted={inverted}>{children}</MediumText>
}

export default Text
