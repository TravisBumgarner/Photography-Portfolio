import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { StyledInput, StyledTextArea } from './Input.styles.js'

class Input extends Component {
    render() {
        const {
            hintText,
            name,
            value,
            onChange,
            theme,
            rows,
            textarea
        } = this.props

        console.log(textarea)

        return textarea ? (
            <StyledTextArea
                theme={theme}
                name={name}
                placeholder={hintText}
                value={value}
                onChange={onChange}
                type="text"
                rows={rows}
            />
        ) : (
            <StyledInput
                theme={theme}
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
    onChange: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    rows: PropTypes.number
}

export default Input
