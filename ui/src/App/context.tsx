import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
} from 'react'
import { GalleryType, PhotoType, PrivateGallery } from 'types'

import getContent from "./content";

export interface State {
  photos: Record<string, PhotoType>;
  galleries: Record<string, GalleryType>;
  backgroundPhotos: PhotoType[];
  privateGalleries: Record<string, PrivateGallery>
}

const EMPTY_STATE: State = {
  photos: {},
  galleries: {},
  backgroundPhotos: [],
  privateGalleries: {},
}

interface HydratePhotos {
  type: 'HYDRATE_PHOTOS'
  payload: {
    photos: Record<string, PhotoType>;
    galleries: Record<string, GalleryType>;
    backgroundPhotos: PhotoType[];
    privateGalleries: Record<string, PrivateGallery>
  }
}

export type Action = HydratePhotos

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'HYDRATE_PHOTOS': {
      return { ...state, ...action.payload }
    }
    default:
      throw new Error('Unexpected action')
  }
}

const context = createContext({
  state: EMPTY_STATE,
  dispatch: () => { },
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