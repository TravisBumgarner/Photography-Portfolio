import fs from 'fs'
import path from 'path'
import processPhoto from './metadata'
import { Metadata } from './types'

type Gallery = {
    title: string
    slug: string
    previewId: string
}

const VALID_EXTENSIONS = ['.jpg']

enum ValidSlugs {
    Mexico = 'mexico',
    Utah = 'utah',
}

const TAG_TO_GALLERY_LOOKUP: Record<string, ValidSlugs> = {
    'cameracoffeewander|Place|Mexico|Country': ValidSlugs.Mexico,
    'cameracoffeewander|Place|USA|Utah|State': ValidSlugs.Utah,
}

const PUBLIC_GALLERIES_BY_TAG: Record<ValidSlugs, Gallery> = {
    [ValidSlugs.Mexico]: {
        title: 'Mexico',
        slug: ValidSlugs.Mexico,
        previewId: 'c5dad9a4-d9eb-5989-862b-f3799dee76c3',
    },
    [ValidSlugs.Utah]: {
        title: 'Utah',
        slug: ValidSlugs.Utah,
        previewId: 'f221c3e0-1beb-5351-a1d9-3026b9245702',
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
        fs.writeFileSync('output.json', data)
    } catch (err) {
        console.log('Unable to scan directory: ' + err)
    }
}
// This is a bit lazy.
export const PHOTO_DIR = '/Users/travisbumgarner/Desktop/large'

main(PHOTO_DIR)
