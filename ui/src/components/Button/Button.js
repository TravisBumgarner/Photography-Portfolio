import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { StyledButton } from './Button.styles.js'

class Button extends Component {
    render() {
        const { onClick, label, theme } = this.props

        return (
            <StyledButton theme={theme} onClick={onClick}>
                {label}
            </StyledButton>
        )
    }
}

Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired
}

export default Button
