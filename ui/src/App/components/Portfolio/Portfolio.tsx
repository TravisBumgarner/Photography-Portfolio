import * as React from 'react'

import { GalleryType, PhotoType } from 'sharedTypes'
import {
    Gallery,
    Photo
} from './components'

const ALL_GALLERY: GalleryType = {
    content_type: 'snapshot',
    slug: 'all',
    title: 'All'
}

type Props = {
    match: {
        params: {
            contentType: string
            gallerySlug: string
            photoIdFromUrl: string
        }
    },
    photos: { [id: string]: PhotoType },
    galleries: GalleryType[],
    history: any
}

const Portfolio = (
    {
        match: {
            params: { contentType, gallerySlug, photoIdFromUrl }
        },
        photos,
        galleries,
        history
    }: Props
) => {
    const [filteredPhotoIds, setFilteredPhotoIds] = React.useState<string[]>([])
    const [selectedFilteredPhotoId, setSelectedFilteredPhotoId] = React.useState<number | undefined>(undefined);
    const filterPhotoIds = () => {
        if (contentType === 'snapshot' && gallerySlug === 'all') {
            const filteredPhotoIds = Object.values(photos).filter(photo => photo.gallery.content_type == 'snapshot').map(({ id }) => id)
            setFilteredPhotoIds(filteredPhotoIds)
        } else {
            const filteredPhotoIds = Object.values(photos).filter(photo => photo.gallery.slug == gallerySlug).map(({ id }) => id)
            setFilteredPhotoIds(filteredPhotoIds)
        }
    }

    React.useEffect(filterPhotoIds, [contentType, gallerySlug])

    // const getSelectedPhotoFromUrl = () => {
    //     if (photoIdFromUrl !== undefined) {
    //         let indexFound;
    //         photos.forEach((photo, index) => {
    //             if (photo.id === photoIdFromUrl) {
    //                 indexFound = index;
    //             }
    //         });
    //         if (indexFound !== undefined) {
    //             setSelectedPhotoIndex(indexFound);
    //         }
    //     }
    // };

    // React.useEffect(
    //     getSelectedPhotoFromUrl,
    //     [
    //         // photos
    //     ]);

    // const handleUrlChange = (newSelectedPhotoIndex: number | undefined) => {
    //     if (newSelectedPhotoIndex !== undefined) {
    //         const { id } = photos[newSelectedPhotoIndex];
    //         history.push(
    //             `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}/${id}`
    //         );
    //     } else {
    //         history.push(
    //             `/portfolio/${galleryDetails.content_type}/${galleryDetails.slug}`
    //         );
    //     }
    // };

    let galleryDetails = galleries.length && galleries.find(gallery => gallery.slug == gallerySlug)
    galleryDetails = galleryDetails || ALL_GALLERY

    // const handleSwitchToSelectedPhoto = (newSelectedPhotoIndex: number) => {
    //     setSelectedPhotoIndex(newSelectedPhotoIndex);
    //     handleUrlChange(newSelectedPhotoIndex);
    // };

    // const handleSwitchToGrid = () => {
    //     setSelectedPhotoIndex(undefined);
    //     handleUrlChange(undefined);
    // };

    return selectedFilteredPhotoId === undefined
        ? (
            <Gallery
                setSelectedFilteredPhotoId={setSelectedFilteredPhotoId}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
                galleryDetails={galleryDetails}
            />
        ) : (
            < Photo
                setSelectedFilteredPhotoId={setSelectedFilteredPhotoId}
                selectedFilteredPhotoId={selectedFilteredPhotoId}
                photos={photos}
                filteredPhotoIds={filteredPhotoIds}
            />
        )
}

export default Portfolio
