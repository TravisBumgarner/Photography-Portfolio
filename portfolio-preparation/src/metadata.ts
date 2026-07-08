import path from 'node:path'
import { format } from 'date-fns'
import * as exifr from 'exifr'
import config from './config'
import { generatePhotoId } from './photo-id'
import type { ParsedData, Sidecar } from './types'

type ExtractedMetadata = {
  id: string
  src: string
  dateTaken: string
  tags: string[]
}

const processPhoto = async (file: string): Promise<ExtractedMetadata | { errors: string[] }> => {
  const data = (await exifr.parse(file)) as ParsedData
  const sidecar = (await exifr.sidecar(file)) as unknown as Sidecar

  if (!sidecar.lr) {
    return { errors: ['No Lightroom lr data for hierarchicalSubject'] }
  }

  if (!sidecar.lr.hierarchicalSubject) {
    return { errors: ['No Lightroom hierarchicalSubject'] }
  }

  const tags = Array.isArray(sidecar.lr.hierarchicalSubject)
    ? sidecar.lr.hierarchicalSubject
    : [sidecar.lr.hierarchicalSubject]

  if (tags.length === 0) {
    return { errors: ['Tags'] }
  }

  const src = file.replace(path.normalize(config.portfolioIngestPath) + path.sep, '')

  return {
    src,
    dateTaken: data.DateTimeOriginal ? format(data.DateTimeOriginal, 'MMMM yyyy') : '',
    tags,
    id: generatePhotoId(src)
  }
}

export default processPhoto
