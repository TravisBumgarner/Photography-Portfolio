import React, { useMemo } from 'react'
import styled from 'styled-components'

import { FONT_FAMILY_TEXT, CONTENT_SPACING, TEXT_FONT_SIZES } from 'theme'

const ListItem = styled.li`
    font-family: ${FONT_FAMILY_TEXT};
    line-height: 1.5;
    padding-bottom: ${CONTENT_SPACING.xs};
    padding-top: ${CONTENT_SPACING.xs};
    font-size: ${TEXT_FONT_SIZES.m};

    &:first-child {
        margin: 0;
    }

    &:last-child {
        margin: 0;
    }
`

type Props = {
    items: string[]
}

const List = ({ items }: Props) => {
    const ListItems = useMemo(() => items.map(child => <ListItem key={child}>{child}</ListItem>)
        , [...items])

    return <ul>{ListItems}</ul>
}

export default List
