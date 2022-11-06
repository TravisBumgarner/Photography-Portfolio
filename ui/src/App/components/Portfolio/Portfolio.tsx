import * as React from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { GalleryType, PhotoType } from 'sharedTypes'
import {
    Gallery,
    Photo
} from './components'

type Props = {
    photos: { [id: string]: PhotoType },
    galleries: GalleryType[],
    setIsTitlebarVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const Portfolio = (
    {
        photos,
        galleries,
        setIsTitlebarVisible,
    }: Props
) => {
    const [filteredPhotoIds, setFilteredPhotoIds] = React.useState<string[]>([])
    const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = React.useState<number | undefined>(undefined);
    const [initialLoad, setInitialLoad] = React.useState(true)
    // I couldn't figure out a more elegant way to load in photo IDs from the URL on initial load so we have this useState.
    const [scrollToId, setScrollToId] = React.useState<number | undefined>(undefined)
    // Used for scrolling
    const { contentType, gallerySlug, photoId } = useParams<{ contentType: string, gallerySlug: string, photoId: string }>();
    const navigate = useNavigate();

    console.log(gallerySlug, photoId)

    React.useEffect(() => setIsTitlebarVisible(selectedFilteredPhotoIndex === undefined), [selectedFilteredPhotoIndex])
    const filterPhotoIds = () => {
        const filteredPhotoIds = Object.values(photos)
            .filter(photo => photo.gallery.slug == gallerySlug)
            .sort((a, b) => {
                const aDate = new Date(a.date_taken)
                const bDate = new Date(b.date_taken)
                return bDate.getTime() - aDate.getTime()
            })
            .map(({ id }) => id)
        return filteredPhotoIds
    }
    React.useEffect(() => {
        const filteredPhotoIds = filterPhotoIds()
        if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
            setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoId))
            setInitialLoad(false)
        }
        setFilteredPhotoIds(filteredPhotoIds)
        setScrollToId(undefined)
    }, [gallerySlug])

    const handleUrlChange = () => {
        if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
            return
        }
        navigate(
            `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
        )
    };
    React.useEffect(handleUrlChange, [filteredPhotoIds[selectedFilteredPhotoIndex]])

    const elementsRef = filteredPhotoIds.map(() => React.createRef())
    const galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)

    return selectedFilteredPhotoIndex === undefined
        ? (
            <Gallery
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
                galleryDetails={galleryDetails}
                scrollToId={scrollToId}
                elementsRef={elementsRef}
                setScrollToId={setScrollToId}
            />
        ) : (
            < Photo
                setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
                selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
                setScrollToId={setScrollToId}
            />
        )
}

export default Portfolio
