import React from 'react';


// const Portfolio = () => {
//   const [filteredPhotoIds, setFilteredPhotoIds] = useState<string[]>([])
//   const { state: { privateGalleries } } = useContext(context)
//   const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = useState<number | undefined>(undefined);
//   const [initialLoad, setInitialLoad] = useState(true) // Use for Initial Load of photo ID from URL
//   const { privateGallerySlug, photoId } = useParams<{ privateGallerySlug: string, photoId: string }>();
//   const navigate = useNavigate();

//   const galleryDetails = privateGalleries[privateGallerySlug].gallery
//   const photos = privateGalleries[privateGallerySlug].photos

//   const filterPhotoIds = useCallback(() => {
//     const filteredPhotoIds = Object.values(photos)
//       .filter(photo => photo.gallery == privateGallerySlug)
//       .sort((a, b) => {
//         const aDate = new Date(a.dateTaken)
//         const bDate = new Date(b.dateTaken)
//         return aDate.getTime() - bDate.getTime()
//       })
//       .map(({ id }) => id)
//     return filteredPhotoIds
//   }, [photos, privateGallerySlug])

//   useEffect(() => {
//     const filteredPhotoIds = filterPhotoIds()
//     if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
//       setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoId))
//       setInitialLoad(false)
//     }
//     setFilteredPhotoIds(filteredPhotoIds)
//   }, [privateGallerySlug])

//   const handleUrlChange = useCallback(() => {
//     if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
//       return
//     }
//     navigate(
//       `/private/${privateGallerySlug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
//     )
//   }, [initialLoad, photoId, selectedFilteredPhotoIndex, privateGallerySlug]);

//   useEffect(handleUrlChange, [selectedFilteredPhotoIndex])

//   const onCloseCallback = useCallback((id: string) => {
//     document.getElementById(id)?.scrollIntoView({ behavior: 'auto' })
//   }, [])

//   return (
//     <>
//       <Gallery
//         setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
//         photos={photos}
//         filteredPhotoIds={filteredPhotoIds}
//         galleryDetails={galleryDetails}
//         privateGallery={true}
//       />
//       <Photo
//         setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
//         selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
//         photos={photos}
//         filteredPhotoIds={filteredPhotoIds}
//         onCloseCallback={onCloseCallback}
//         privateGallery={true}
//         gallerySlug={galleryDetails.slug}
//       />
//     </>
//   )
// }

const Portfolio = () => {
  return (
    <div>
      Portfolio
    </div>
  )
}

export default Portfolio