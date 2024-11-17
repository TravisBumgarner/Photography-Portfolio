import React, { useMemo } from 'react'

import styled from 'styled-components'

import { CONTENT_SPACING, FONT_SIZES } from '../theme'

const ListItem = styled.li`
  line-height: 1.5;
  padding-bottom: ${CONTENT_SPACING.XSMALL};
  padding-top: ${CONTENT_SPACING.XSMALL};
  font-size: ${FONT_SIZES.MEDIUM};

  &:first-child {
    margin: 0;
  }

  &:last-child {
    margin: 0;
  }
`

interface Props {
  items: string[]
}

const List = ({ items }: Props) => {
  const ListItems = useMemo(
    () => items.map(child => <ListItem key={child}>{child}</ListItem>),
    [items]
  )

  return <ul>{ListItems}</ul>
}

export default List
