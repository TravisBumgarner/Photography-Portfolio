type GalleryType = {
    "id": number
    "title": string
    "content_type": string
    "description": string
    "start_date": string
    "end_date": string
    "slug": string
}

type CategoryType = {
    "id": number
    "title": string
}

type LocationType = {
    "id": number,
    "title": string
}

type PhotoType = {
    "id": number
    "src": string
    "file_name": string
    "gallery": GalleryType
    "location": LocationType
    "date_taken": string
    "category": CategoryType[]
    "width": number
    "height": number
    "src_thumbnail_medium": string
    "src_thumbnail_small": string
    "camera_type": "Digital" | "Film"
    "make": string
    "model": string
    "lens": string
    "shooting_mode": string
    "aperture": string
    "shutter_speed": string
    "iso": string
    "focal_length": string
    "is_home_background": boolean
}

export { LocationType, CategoryType, GalleryType, PhotoType }