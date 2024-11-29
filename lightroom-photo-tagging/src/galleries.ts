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
        previewSrc: '20240422-DJI_0114.avif',
    },
    [ValidSlugs.Arizona]: {
        title: 'Arizona',
        slug: ValidSlugs.Arizona,
        previewSrc: '20230317-DSC_2189.avif',
    },
    [ValidSlugs.ArchitectureOfMexico]: {
        title: 'Architecture of Mexico',
        slug: ValidSlugs.ArchitectureOfMexico,
        previewSrc: '20221112-DSC_0653.avif',
    },
    [ValidSlugs.MontanaAndWyoming]: {
        title: 'Montana & Wyoming',
        slug: ValidSlugs.MontanaAndWyoming,
        previewSrc: '20230819-DSC_0377.avif',
    },
    [ValidSlugs.ToritosDeTultepec]: {
        title: 'Toritos de Tultepec',
        slug: ValidSlugs.ToritosDeTultepec,
        previewSrc: '20240308-DSC_1435.avif',
    },
    [ValidSlugs.MexicoSnapshots]: {
        title: 'Mexico Snapshots',
        slug: ValidSlugs.MexicoSnapshots,
        previewSrc: '20191103-DSC_6882.avif',
    },
    [ValidSlugs.NegativeSpace]: {
        title: 'Negative Space',
        slug: ValidSlugs.NegativeSpace,
        previewSrc: '20180502-DSC_0711.avif',
    },
    [ValidSlugs.WesternCanada]: {
        title: 'Western Canada',
        slug: ValidSlugs.WesternCanada,
        previewSrc: '20230611-DSC_5126.avif',
    },
    [ValidSlugs.DayOfTheDead]: {
        title: 'Day of the Dead',
        slug: ValidSlugs.DayOfTheDead,
        previewSrc: '20191027-DSC_5739.avif',
    },
    [ValidSlugs.Life]: {
        title: 'Life',
        slug: ValidSlugs.Life,
        previewSrc: '20231004-000016240006.avif',
    },
    [ValidSlugs.PacficNorthwest]: {
        title: 'Pacific Northwest',
        slug: ValidSlugs.PacficNorthwest,
        previewSrc: '20211012-PXL_20211012_193330508.avif',
    },
    [ValidSlugs.Alaska]: {
        title: 'Alaska',
        slug: ValidSlugs.Alaska,
        previewSrc: '20170826-DSC_0814.avif',
    },
    [ValidSlugs.Animals]: {
        title: 'Animals',
        slug: ValidSlugs.Animals,
        previewSrc: '20230610-DSC_5028.avif',
    },
    [ValidSlugs.BajaCalifornia]: {
        title: 'Baja California',
        slug: ValidSlugs.BajaCalifornia,
        previewSrc: '20230208-DSC_1494.avif',
    },
    [ValidSlugs.WesternEurope]: {
        title: 'Western Europe',
        slug: ValidSlugs.WesternEurope,
        previewSrc: '20180424-DSC_0290.avif',
    },
    [ValidSlugs.Boston]: {
        title: 'Boston',
        slug: ValidSlugs.Boston,
        previewSrc: '20200216-DSC_0554.avif',
    },
    [ValidSlugs.Iceland]: {
        title: 'Iceland',
        slug: ValidSlugs.Iceland,
        previewSrc: '20190630-DSC_1343.avif',
    },
    [ValidSlugs.PeruToGuatemala]: {
        title: 'From Peru to Guatemala',
        slug: ValidSlugs.PeruToGuatemala,
        previewSrc: '20150910-DSC08407.avif',
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
