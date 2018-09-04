import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { StyledInput } from './Input.styles.js'

class Input extends Component {
    render() {
        const { hintText, name, value, onChange } = this.props

        return (
            <StyledInput
                name={name}
                placeholder={hintText}
                value={value}
                onChange={onChange}
                type="text"
            />
        )
    }
}

Input.propTypes = {
    hintText: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Input
