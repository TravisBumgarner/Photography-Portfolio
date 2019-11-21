import { number } from "prop-types"

type Photo = {
    "id": number
    "src": string
    "file_name": string
    "gallery": {
        "id": number
    }
    "location": {
        "id": number
    }
    "date_taken": string
    "category": { id: number }[]
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

type Gallery = {
    "id": number
    "title": string
    "content_type": string
    "description": string
    "start_date": string
    "end_date": string
    "slug": string
}

type Category = {
    "id": number
    "title": string
}

type Location = {
    "id": number,
    "title": string
}

export { Location, Category, Gallery, Photo }