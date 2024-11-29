import type {} from '@redux-devtools/extension'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import getData from './content' // Import the getData function
import { type GalleryType, type PhotoType, type PrivateGallery } from './types'

export interface State {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  privateGalleries: Record<string, PrivateGallery>
  setPhotos: (photos: Record<string, PhotoType>) => void
  setGalleries: (galleries: Record<string, GalleryType>) => void
  setPrivateGalleries: (
    privateGalleries: Record<string, PrivateGallery>
  ) => void
}

const initialData = getData() // Fetch the initial data

const usePhotoStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        photos: initialData.photos,
        galleries: initialData.galleries,
        privateGalleries: initialData.privateGalleries,
        setPhotos: photos => {
          set({ photos })
        },
        setGalleries: galleries => {
          set({ galleries })
        },
        setPrivateGalleries: privateGalleries => {
          set({ privateGalleries })
        }
      }),
      {
        name: 'photo-store'
      }
    )
  )
)

export default usePhotoStore
