export const getPhotoUrl = ({ isThumbnail, privateGalleryId, photoSrc }: { isThumbnail: boolean, privateGalleryId?: string, photoSrc: string }) => {

    let url = 'https://storage.googleapis.com/photo21/photos/'
    if (privateGalleryId) {
        url += `${privateGalleryId}/`
    }

    url += isThumbnail ? 'thumbnail/' : 'large/'
    url += encodeURIComponent(photoSrc)
    return url
}