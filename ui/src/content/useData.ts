import { useEffect, useState } from 'react'
import type { GalleryType, PhotoType, PrivateGallery } from '../types'
import output from './output.json'

interface Data {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  privateGalleries: Record<string, PrivateGallery>
}


export const useData = () => {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setData({
      photos: output.photos,
      galleries: output.galleries,
      privateGalleries: {}
    })
  }, [])

  return data
}
