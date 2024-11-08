import fs from 'fs'
import path from 'path'
import processPhoto from './metadata'
import { Metadata } from './types'

type Gallery = {
    title: string
    slug: string
    previewSrc: string
}

const VALID_EXTENSIONS = ['.jpg']

enum ValidSlugs {
    LifeInMexico = 'life-in-mexico',
    BajaCalifornia = 'baja-california',
    Montana = 'montana',
    Utah = 'utah',
    Arizona = 'arizona',
    Shadows = 'shadows',
    Iceland = 'iceland',
    Colorado = 'colorado',
}

// It's possible in the future that multiple slugs could map to the same gallery.

const TAG_TO_GALLERY_LOOKUP: Record<string, ValidSlugs> = {
    'PhotographyPortfolioV2|Montana': ValidSlugs.Montana,
    'PhotographyPortfolioV2|Utah': ValidSlugs.Utah,
    'PhotographyPortfolioV2|Arizona': ValidSlugs.Arizona,
    'PhotographyPortfolioV2|Colorado': ValidSlugs.Colorado,
    'PhotographyPortfolioV2|Iceland': ValidSlugs.Iceland,
    'PhotographyPortfolioV2|Life in Mexico': ValidSlugs.LifeInMexico,
    'PhotographyPortfolioV2|Baja California': ValidSlugs.BajaCalifornia,
    'PhotographyPortfolioV2|Shadows': ValidSlugs.Shadows,
}

// previewSrc is the ID of the photo to be used for the gallery preview on the home page.
const PUBLIC_GALLERIES_BY_TAG: Record<ValidSlugs, Gallery> = {
    [ValidSlugs.LifeInMexico]: {
        title: 'Life in Mexico',
        slug: ValidSlugs.LifeInMexico,
        previewSrc: 'DSC_0197.jpg',
    },
    [ValidSlugs.BajaCalifornia]: {
        title: 'Baja California',
        slug: ValidSlugs.BajaCalifornia,
        previewSrc: 'DSC_1494.jpg',
    },
    [ValidSlugs.Montana]: {
        title: 'Montana',
        slug: ValidSlugs.Montana,
        previewSrc: 'DSC_0424.jpg',
    },
    [ValidSlugs.Utah]: {
        title: 'Utah',
        slug: ValidSlugs.Utah,
        previewSrc: 'DJI_0024.jpg',
    },
    [ValidSlugs.Arizona]: {
        title: 'Arizona',
        slug: ValidSlugs.Arizona,
        previewSrc: 'DSC_1675.jpg',
    },
    [ValidSlugs.Shadows]: {
        title: 'Shadows',
        slug: ValidSlugs.Shadows,
        previewSrc: 'Foto-27.jpg',
    },
    [ValidSlugs.Iceland]: {
        title: 'Iceland',
        slug: ValidSlugs.Iceland,
        previewSrc: '000555070007.jpg',
    },
    [ValidSlugs.Colorado]: {
        title: 'Colorado',
        slug: ValidSlugs.Colorado,
        previewSrc: 'DSC_0252.jpg',
    },
}

const main = async (directoryPath: string) => {
    const errorsByFile: Record<string, string[]> = {}

    const photos: Record<string, Metadata & { galleryIds: string[] }> = {}

    try {
        const files = fs.readdirSync(directoryPath)

        console.log('Gathering tags...')
        for (const file of files) {
            if (!VALID_EXTENSIONS.includes(path.extname(file))) {
                console.log(
                    '\tSkipping for invalid file type',
                    path.extname(file)
                )
                continue
            }

            const filePath = path.join(directoryPath, file)
            console.log('\t', filePath)

            const metadata = await processPhoto(filePath)

            if ('errors' in metadata) {
                errorsByFile[file] = metadata.errors
                continue
            }

            const galleryIds = metadata.tags.reduce((accum, tag) => {
                const gallerySlug = TAG_TO_GALLERY_LOOKUP[tag]

                if (gallerySlug) {
                    accum.push(gallerySlug)
                }

                return accum
            }, [] as string[])

            if (galleryIds.length === 0) {
                errorsByFile[file] = [
                    'No valid galleries found for tags:' +
                        metadata.tags.join(','),
                ]
                continue
            }

            photos[metadata.id] = { ...metadata, galleryIds }
        }

        if (Object.keys(errorsByFile).length > 0) {
            console.log('Errors by file:')
            console.log(errorsByFile)
        } else {
            console.log(photos)
        }

        const data = JSON.stringify({
            galleries: PUBLIC_GALLERIES_BY_TAG,
            photos,
        })
        fs.writeFileSync(
            '/Users/travisbumgarner/Programming/Photography-Portfolio/ui/src/App/content/output.json',
            data
        )
    } catch (err) {
        console.log('Unable to scan directory: ' + err)
    }
}
// This is a bit lazy.
export const PHOTO_DIR = '/Users/travisbumgarner/Desktop/large'

main(PHOTO_DIR)
