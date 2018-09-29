import React from 'react'
import Styled from 'styled-components'

const RATIO = 192 / 275 // Copied from below

const NatGeoIcon = Styled(({ className }) => <div className={className} />)`
    background: url("data:image/svg+xml, %3Csvg class='bar' viewBox='0 0 192 275' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='NatGeo'%3E%3Cpolygon id='Path' fill='%23000000' points='0 0 191.831055 0 191.831055 274.935547 0 274.935547' /%3E%3Cpolygon id='Path-2' fill='%23FFFFFF' points='28 28 28 246.177734 162.570312 246.177734 162.570312 28' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E") no-repeat 0 0;
    width: 100%;
    height: 100%;
`

const NatGeoIconWrapper = Styled(({ className, size }) => (
    <div className={className}>
        <NatGeoIcon />
    </div>
))`
    width: ${props => parseFloat(props.size) * RATIO}em;
    display: flex;
    align-items: center;
    height: ${props => props.size};
    display: inline-block;
    padding: 2px;
    box-sizing: border-box;
`
export default NatGeoIconWrapper
