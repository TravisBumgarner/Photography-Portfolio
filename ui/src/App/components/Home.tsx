import React, { useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { context } from '../context'
import { getPhotoUrl } from '../utils'
import { Link } from 'react-router-dom'
import {Header, LazyImage} from 'sharedComponents'

const HomeImageWrapper = styled.div`
  display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem;
`

const Home = () => {
  const { state: {galleries, photos} } = useContext(context)

  return (
    <HomeImageWrapper>{Object.values(galleries).map(({slug, title, previewId}) => {

      const url = getPhotoUrl({ isThumbnail: true, photoSrc: photos[previewId].src, privateGalleryId: undefined })
      return (
        <Link style={{textDecoration: 'none', textAlign: 'center', color: 'black'}} id={slug} to={`/${slug}`} key={slug}>
          <LazyImage url={url} />
          <Header size='h2'>{title}</Header>
        </Link>
      )
      })}
    </HomeImageWrapper>
  )
}

export default Home
