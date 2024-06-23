import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch
} from 'react'
import { type GalleryType, type PhotoType, type PrivateGallery } from 'types'

import getContent from './content'

export interface State {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  backgroundPhotos: PhotoType[]
  privateGalleries: Record<string, PrivateGallery>
  selectedGalleryPhotoIds: string[] | null
  previouslySelectedPhotoId: string | null
  loadedGalleryId: string | null
}

const EMPTY_STATE: State = {
  photos: {},
  galleries: {},
  backgroundPhotos: [],
  privateGalleries: {},
  selectedGalleryPhotoIds: null,
  previouslySelectedPhotoId: null,
  loadedGalleryId: null
}

interface SetSelectedGalleryPhotoIds {
  type: 'SET_SELECTED_GALLERY_PHOTO_IDS'
  payload: {
    selectedGalleryPhotoIds: string[]
    loadedGalleryId: string | null
  }
}

interface HydratePhotos {
  type: 'HYDRATE_PHOTOS'
  payload: {
    photos: Record<string, PhotoType>
    galleries: Record<string, GalleryType>
    backgroundPhotos: PhotoType[]
    privateGalleries: Record<string, PrivateGallery>
  }
}

interface SetPreviouslySelectedPhotoId {
  type: 'BACK_TO_GALLERY'
  payload: {
    previouslySelectedPhotoId: string | null
  }
}

export type Action = HydratePhotos | SetSelectedGalleryPhotoIds | SetPreviouslySelectedPhotoId

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'HYDRATE_PHOTOS': {
      return { ...state, ...action.payload }
    }
    case 'SET_SELECTED_GALLERY_PHOTO_IDS': {
      return { ...state, selectedGalleryPhotoIds: action.payload.selectedGalleryPhotoIds, loadedGalleryId: action.payload.loadedGalleryId }
    }
    case 'BACK_TO_GALLERY': {
      return { ...state, previouslySelectedPhotoId: action.payload.previouslySelectedPhotoId, selectedGalleryPhotoIds: null }
    }
  }
}

const context = createContext({
  state: EMPTY_STATE,
  dispatch: () => { }
} as {
  state: State
  dispatch: Dispatch<Action>
})

const ResultsContext = ({ children }: { children: JSX.Element }) => {
  const [state, dispatch] = useReducer(reducer, EMPTY_STATE)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(true)
    const { galleries, backgroundPhotos, photos, privateGalleries } = getContent()

    dispatch({ type: 'HYDRATE_PHOTOS', payload: { photos, backgroundPhotos, galleries, privateGalleries } })
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <p>Loading...</p>
  }

  const { Provider } = context

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export default ResultsContext
export { context }
