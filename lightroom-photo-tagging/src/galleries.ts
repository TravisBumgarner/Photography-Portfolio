import { generatePhotoId } from './metadata'

type Gallery = {
    title: string
    slug: string
    previewSrc: string
    previewId: string
}

enum ValidSlugs {
    Alaska = 'alaska',
    Animals = 'animals',
    ArchitectureOfMexico = 'architecture-of-mexico',
    Arizona = 'arizona',
    BajaCalifornia = 'baja-california',
    Boston = 'boston',
    DayOfTheDead = 'day-of-the-dead',
    Iceland = 'iceland',
    Life = 'life',
    MexicoSnapshots = 'mexico-snapshots',
    MontanaAndWyoming = 'montana-and-wyoming',
    NegativeSpace = 'negative-space',
    PacficNorthwest = 'pacific-northwest',
    PeruToGuatemala = 'peru-to-guatemala',
    ToritosDeTultepec = 'toritos-de-tultepec',
    UtahColoradoNeveda = 'utah-colorado-nevada',
    WesternCanada = 'western-canada',
    WesternEurope = 'western-europe',
}

// It's possible in the future that multiple slugs could map to the same gallery.

export const TAG_TO_GALLERY_LOOKUP: Record<string, ValidSlugs> = {
    'PhotographyPortfolioV2|Alaska': ValidSlugs.Alaska,
    'PhotographyPortfolioV2|Animals': ValidSlugs.Animals,
    'PhotographyPortfolioV2|Architecture of Mexico':
        ValidSlugs.ArchitectureOfMexico,
    'PhotographyPortfolioV2|Arizona': ValidSlugs.Arizona,
    'PhotographyPortfolioV2|Baja California': ValidSlugs.BajaCalifornia,
    'PhotographyPortfolioV2|Boston': ValidSlugs.Boston,
    'PhotographyPortfolioV2|Day of the Dead': ValidSlugs.DayOfTheDead,
    'PhotographyPortfolioV2|Iceland': ValidSlugs.Iceland,
    'PhotographyPortfolioV2|Life': ValidSlugs.Life,
    'PhotographyPortfolioV2|Mexico Snapshots': ValidSlugs.MexicoSnapshots,
    'PhotographyPortfolioV2|Montana and Wyoming': ValidSlugs.MontanaAndWyoming,
    'PhotographyPortfolioV2|Negative Space': ValidSlugs.NegativeSpace,
    'PhotographyPortfolioV2|Pacific Northwest': ValidSlugs.PacficNorthwest,
    'PhotographyPortfolioV2|Peru to Guatemala': ValidSlugs.PeruToGuatemala,
    'PhotographyPortfolioV2|Toritos de Tultepec': ValidSlugs.ToritosDeTultepec,
    'PhotographyPortfolioV2|Utah Colorado Nevada':
        ValidSlugs.UtahColoradoNeveda,
    'PhotographyPortfolioV2|Western Canada': ValidSlugs.WesternCanada,
    'PhotographyPortfolioV2|Western Europe': ValidSlugs.WesternEurope,
}

// previewSrc is the ID of the photo to be used for the gallery preview on the home page.
const PUBLIC_GALLERIES_BY_TAG_WITHOUT_PREVIEW_ID: Record<
    ValidSlugs,
    Omit<Gallery, 'previewId'>
> = {
    [ValidSlugs.UtahColoradoNeveda]: {
        title: 'Utah Colorado & Nevada',
        slug: ValidSlugs.UtahColoradoNeveda,
        previewSrc: 'DJI_0114.jpg',
    },
    [ValidSlugs.Arizona]: {
        title: 'Arizona',
        slug: ValidSlugs.Arizona,
        previewSrc: 'DSC_2189.jpg',
    },
    [ValidSlugs.ArchitectureOfMexico]: {
        title: 'Architecture of Mexico',
        slug: ValidSlugs.ArchitectureOfMexico,
        previewSrc: 'DSC_0653.jpg',
    },
    [ValidSlugs.MontanaAndWyoming]: {
        title: 'Montana & Wyoming',
        slug: ValidSlugs.MontanaAndWyoming,
        previewSrc: 'DSC_0377.jpg',
    },
    [ValidSlugs.ToritosDeTultepec]: {
        title: 'Toritos de Tultepec',
        slug: ValidSlugs.ToritosDeTultepec,
        previewSrc: 'DSC_1435.jpg',
    },
    [ValidSlugs.MexicoSnapshots]: {
        title: 'Mexico Snapshots',
        slug: ValidSlugs.MexicoSnapshots,
        previewSrc: 'DSC_6882.jpg',
    },
    [ValidSlugs.NegativeSpace]: {
        title: 'Negative Space',
        slug: ValidSlugs.NegativeSpace,
        previewSrc: 'DSC_0711.jpg',
    },
    [ValidSlugs.WesternCanada]: {
        title: 'Western Canada',
        slug: ValidSlugs.WesternCanada,
        previewSrc: 'DSC_5126.jpg',
    },
    [ValidSlugs.DayOfTheDead]: {
        title: 'Day of the Dead',
        slug: ValidSlugs.DayOfTheDead,
        previewSrc: 'DSC_5739.jpg',
    },
    [ValidSlugs.Life]: {
        title: 'Life',
        slug: ValidSlugs.Life,
        previewSrc: '000016240006.jpg',
    },
    [ValidSlugs.PacficNorthwest]: {
        title: 'Pacific Northwest',
        slug: ValidSlugs.PacficNorthwest,
        previewSrc: 'PXL_20211012_193330508.jpg',
    },
    [ValidSlugs.Alaska]: {
        title: 'Alaska',
        slug: ValidSlugs.Alaska,
        previewSrc: 'DSC_0814.jpg',
    },
    [ValidSlugs.Animals]: {
        title: 'Animals',
        slug: ValidSlugs.Animals,
        previewSrc: 'DSC_5028.jpg',
    },
    [ValidSlugs.BajaCalifornia]: {
        title: 'Baja California',
        slug: ValidSlugs.BajaCalifornia,
        previewSrc: 'DSC_1494.jpg',
    },
    [ValidSlugs.WesternEurope]: {
        title: 'Western Europe',
        slug: ValidSlugs.WesternEurope,
        previewSrc: 'DSC_0290.jpg',
    },
    [ValidSlugs.Boston]: {
        title: 'Boston',
        slug: ValidSlugs.Boston,
        previewSrc: 'DSC_0554.jpg',
    },
    [ValidSlugs.Iceland]: {
        title: 'Iceland',
        slug: ValidSlugs.Iceland,
        previewSrc: 'DSC_1343.jpg',
    },
    [ValidSlugs.PeruToGuatemala]: {
        title: 'From Peru to Guatemala',
        slug: ValidSlugs.PeruToGuatemala,
        previewSrc: 'DSC08407.jpg',
    },
}

export const PUBLIC_GALLERIES_BY_TAG: Record<ValidSlugs, Gallery> =
    Object.entries(PUBLIC_GALLERIES_BY_TAG_WITHOUT_PREVIEW_ID).reduce(
        (accum, [slug, gallery]) => {
            return {
                ...accum,
                [slug]: {
                    ...gallery,
                    previewId: generatePhotoId(gallery.previewSrc),
                },
            }
        },
        {} as Record<ValidSlugs, Gallery>
    )