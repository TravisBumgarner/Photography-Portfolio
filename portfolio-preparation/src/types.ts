// The shape the UI consumes from output.json (see ui/src/types.ts).
export type PortfolioPhoto = {
  id: string
  src: string
  galleryIds: string[]
  dateTaken: string
  blurHash: string
  width: number
  height: number
}

export type Sidecar = {
  lr?: {
    hierarchicalSubject?: string[]
  }
}

export type ParsedData = {
  DateTimeOriginal?: string
}
