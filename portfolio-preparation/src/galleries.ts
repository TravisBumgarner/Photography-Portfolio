import { generatePhotoId } from './photo-id'

type Gallery = {
  title: string
  slug: string
  previewSrc: string
  previewId: string
}

enum ValidSlugs {
  Alaska = 'alaska',
  Dogs = 'for-the-love-of-dogs',
  ArchitectureOfMexico = 'architecture-of-mexico',
  Arizona = 'arizona',
  BajaCalifornia = 'baja-california',
  Boston = 'boston',
  DayOfTheDead = 'day-of-the-dead',
  Iceland = 'iceland',
  UnitedStatesSnapshots = 'united-states-snapshots',
  RoadTripToArcticOcean = 'road-trip-to-the-arctic-ocean',
  MexicoSnapshots = 'mexico-snapshots',
  MontanaAndWyoming = 'montana-and-wyoming',
  NegativeSpace = 'negative-space',
  PacficNorthwest = 'pacific-northwest',
  PeruToGuatemala = 'peru-to-guatemala',
  ToritosDeTultepec = 'toritos-de-tultepec',
  UtahColoradoNeveda = 'utah-colorado-nevada',
  WesternCanada = 'western-canada',
  WesternEurope = 'western-europe'
}

// It's possible in the future that multiple slugs could map to the same gallery.

export const TAG_TO_GALLERY_LOOKUP: Record<string, ValidSlugs> = {
  'PhotographyPortfolioV3|Alaska': ValidSlugs.Alaska,
  'PhotographyPortfolioV3|For the Love of Dogs': ValidSlugs.Dogs,
  'PhotographyPortfolioV3|Architecture of Mexico': ValidSlugs.ArchitectureOfMexico,
  'PhotographyPortfolioV3|Arizona': ValidSlugs.Arizona,
  'PhotographyPortfolioV3|Baja California': ValidSlugs.BajaCalifornia,
  'PhotographyPortfolioV3|Boston': ValidSlugs.Boston,
  'PhotographyPortfolioV3|Day of the Dead': ValidSlugs.DayOfTheDead,
  'PhotographyPortfolioV3|Iceland': ValidSlugs.Iceland,
  'PhotographyPortfolioV3|United States Snapshots': ValidSlugs.UnitedStatesSnapshots,
  'PhotographyPortfolioV3|Road Trip to the Arctic Ocean': ValidSlugs.RoadTripToArcticOcean,
  'PhotographyPortfolioV3|Mexican Snapshots': ValidSlugs.MexicoSnapshots,
  'PhotographyPortfolioV3|Montana &amp; Wyoming': ValidSlugs.MontanaAndWyoming,
  'PhotographyPortfolioV3|Negative Space': ValidSlugs.NegativeSpace,
  'PhotographyPortfolioV3|PNW': ValidSlugs.PacficNorthwest,
  'PhotographyPortfolioV3|Peru to Guatemala': ValidSlugs.PeruToGuatemala,
  'PhotographyPortfolioV3|Toritos de Tultepec': ValidSlugs.ToritosDeTultepec,
  'PhotographyPortfolioV3|Utah Colorado Nevada': ValidSlugs.UtahColoradoNeveda,
  'PhotographyPortfolioV3|Western Canada': ValidSlugs.WesternCanada,
  'PhotographyPortfolioV3|Western Europe': ValidSlugs.WesternEurope
}

// previewSrc is the ID of the photo to be used for the gallery preview on the home page.
const PUBLIC_GALLERIES_BY_TAG_WITHOUT_PREVIEW_ID: Record<ValidSlugs, Omit<Gallery, 'previewId'>> = {
  [ValidSlugs.RoadTripToArcticOcean]: {
    title: 'Road Trip to the Arctic Ocean',
    slug: ValidSlugs.RoadTripToArcticOcean,
    previewSrc: '20250622-DSC_1472.avif'
  },
  [ValidSlugs.MexicoSnapshots]: {
    title: 'Mexico Snapshots',
    slug: ValidSlugs.MexicoSnapshots,
    previewSrc: '20191103-DSC_6882.avif'
  },
  [ValidSlugs.UtahColoradoNeveda]: {
    title: 'Utah Colorado & Nevada',
    slug: ValidSlugs.UtahColoradoNeveda,
    previewSrc: '20240422-DJI_0114.avif'
  },
  [ValidSlugs.Arizona]: {
    title: 'Arizona',
    slug: ValidSlugs.Arizona,
    previewSrc: '20230317-DSC_2189.avif'
  },
  [ValidSlugs.ArchitectureOfMexico]: {
    title: 'Architecture of Mexico',
    slug: ValidSlugs.ArchitectureOfMexico,
    previewSrc: '20221112-DSC_0653.avif'
  },
  [ValidSlugs.MontanaAndWyoming]: {
    title: 'Montana & Wyoming',
    slug: ValidSlugs.MontanaAndWyoming,
    previewSrc: '20230819-DSC_0377.avif'
  },
  [ValidSlugs.ToritosDeTultepec]: {
    title: 'Toritos de Tultepec',
    slug: ValidSlugs.ToritosDeTultepec,
    previewSrc: '20240308-DSC_1435.avif'
  },
  [ValidSlugs.NegativeSpace]: {
    title: 'Negative Space',
    slug: ValidSlugs.NegativeSpace,
    previewSrc: '20180502-DSC_0711.avif'
  },
  [ValidSlugs.WesternCanada]: {
    title: 'Western Canada',
    slug: ValidSlugs.WesternCanada,
    previewSrc: '20230611-DSC_5126.avif'
  },
  [ValidSlugs.DayOfTheDead]: {
    title: 'Day of the Dead',
    slug: ValidSlugs.DayOfTheDead,
    previewSrc: '20191027-DSC_5739.avif'
  },
  [ValidSlugs.UnitedStatesSnapshots]: {
    title: 'United States Snapshots',
    slug: ValidSlugs.UnitedStatesSnapshots,
    previewSrc: '20260628-000016240006.avif'
  },
  [ValidSlugs.PacficNorthwest]: {
    title: 'Pacific Northwest',
    slug: ValidSlugs.PacficNorthwest,
    previewSrc: '20211012-PXL_20211012_193330508.avif'
  },
  [ValidSlugs.Alaska]: {
    title: 'Alaska',
    slug: ValidSlugs.Alaska,
    previewSrc: '20170826-DSC_0814.avif'
  },
  [ValidSlugs.Dogs]: {
    title: 'For the Love of Dogs',
    slug: ValidSlugs.Dogs,
    previewSrc: '20230610-DSC_5028.avif'
  },
  [ValidSlugs.BajaCalifornia]: {
    title: 'Baja California',
    slug: ValidSlugs.BajaCalifornia,
    previewSrc: '20230208-DSC_1494.avif'
  },
  [ValidSlugs.WesternEurope]: {
    title: 'Western Europe',
    slug: ValidSlugs.WesternEurope,
    previewSrc: '20180424-DSC_0290.avif'
  },
  [ValidSlugs.Boston]: {
    title: 'Boston',
    slug: ValidSlugs.Boston,
    previewSrc: '20200216-DSC_0554.avif'
  },
  [ValidSlugs.Iceland]: {
    title: 'Iceland',
    slug: ValidSlugs.Iceland,
    previewSrc: '20190630-DSC_1343.avif'
  },
  [ValidSlugs.PeruToGuatemala]: {
    title: 'From Peru to Guatemala',
    slug: ValidSlugs.PeruToGuatemala,
    previewSrc: '20150910-DSC08407.avif'
  }
}

export const PUBLIC_GALLERIES_BY_TAG: Record<ValidSlugs, Gallery> = Object.entries(
  PUBLIC_GALLERIES_BY_TAG_WITHOUT_PREVIEW_ID
).reduce(
  (accum, [slug, gallery]) => {
    accum[slug as ValidSlugs] = {
      ...gallery,
      previewId: generatePhotoId(gallery.previewSrc)
    }
    return accum
  },
  {} as Record<ValidSlugs, Gallery>
)
