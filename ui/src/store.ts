import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import getData from './content'
import { type GalleryType, type PhotoType } from './types'

export interface State {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  selectedGallery: { id: string } | null
  selectedPhotoId: string | null
  setSelectedPhotoId: (selectedPhotoId: string | null) => void
  setPhotos: (photos: Record<string, PhotoType>) => void
  setGalleries: (galleries: Record<string, GalleryType>) => void
  setSelectedGallery: (selectedGallery: { id: string }) => void
  getSelectedGalleryPhotoIdsByGalleryId: () => string[]
}

const initialData = getData()

const usePhotoStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        photos: initialData.photos,
        galleries: initialData.galleries,
        selectedGallery: null,
        selectedPhotoId: null,
        setPhotos: photos => {
          set({ photos })
        },
        setGalleries: galleries => {
          set({ galleries })
        },
        setSelectedGallery: selectedGallery => {
          set({ selectedGallery })
        },
        setSelectedPhotoId: selectedPhotoId => {
          set({ selectedPhotoId })
        },
        getSelectedGalleryPhotoIdsByGalleryId: () => {
          const photos = get().photos
          const selectedGallery = get().selectedGallery

          if (!selectedGallery) return []
          return Object.values(photos)
            .filter(photo => photo.galleryIds.includes(selectedGallery.id))
            .sort((a, b) => {
              const aDate = new Date(a.dateTaken)
              const bDate = new Date(b.dateTaken)
              return aDate.getTime() - bDate.getTime()
            })
            .map(({ id }) => id)
        }
      }),
      {
        name: 'photo-store'
      }
    )
  )
)

export default usePhotoStore
