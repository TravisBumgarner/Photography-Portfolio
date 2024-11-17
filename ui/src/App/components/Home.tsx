import React, { useContext } from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import { LazyImage } from 'sharedComponents'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'
import { context } from '../context'
import { getPhotoUrl } from '../utils'

const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: ${CONTENT_SPACING.LARGE};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Home = () => {
  const {
    state: { galleries, photos }
  } = useContext(context)

  return (
    <HomeImageWrapper>
      {Object.values(galleries).map(({ slug, title, previewSrc }) => {
        const url = getPhotoUrl({
          isThumbnail: true,
          photoSrc: previewSrc,
          privateGalleryId: undefined
        })

        return (
          <div key={slug}>
            <Link
              style={{
                textDecoration: 'none',
                textAlign: 'center',
                color: 'black'
              }}
              id={slug}
              to={`/${slug}`}
            >
              <LazyImage url={url} />
              <Header>{title}</Header>
            </Link>
          </div>
        )
      })}
    </HomeImageWrapper>
  )
}

const Header = styled.h2`
  font-weight: 700;
  margin-bottom: ${CONTENT_SPACING.MEDIUM};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.SMALL};
  text-align: left;
`

export default Home
