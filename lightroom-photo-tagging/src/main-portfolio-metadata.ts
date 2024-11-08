import fs from 'fs'
import path from 'path'
import processPhoto from './metadata'
import { Metadata } from './types'

type Gallery = {
    title: string
    slug: string
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
    },
    [ValidSlugs.Utah]: {
        title: 'Utah',
        slug: ValidSlugs.Utah,
    },
}

const main = async (directoryPath: string) => {
    const errorsByFile: Record<string, string[]> = {}

    // try {
    //     const files = fs.readdirSync(directoryPath)

    //     files.forEach(file => {
    //         if (path.extname(file) === '.txt') {
    //             try {
    //                 fs.unlinkSync(path.join(directoryPath, file))
    //                 console.log(`Deleted file: ${file}`)
    //             } catch (err) {
    //                 console.log(`Error deleting file: ${file}`)
    //             }
    //         }
    //     })
    // } catch (err) {
    //     console.log('Unable to scan directory: ' + err)
    // }

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
