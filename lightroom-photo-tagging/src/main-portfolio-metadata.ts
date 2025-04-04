import fs from 'fs'
import path from 'path'
import { encodeImageToBlurHash } from './blur-hash'
import { PUBLIC_GALLERIES_BY_TAG, TAG_TO_GALLERY_LOOKUP } from './galleries'
import processPhoto from './metadata'
import { Metadata } from './types'

const VALID_EXTENSIONS = ['.avif']

const main = async (directoryPath: string) => {
    const errorsByFile: Record<string, string[]> = {}

    const photos: Record<
        string,
        Partial<Metadata> & {
            galleryIds: string[]
            blurHash: string
            width: number
            height: number
        }
    > = {}

    try {
        const files = fs.readdirSync(directoryPath)

        console.log('Gathering tags...')
        for (const file of files) {
            console.log(file)
            if (!VALID_EXTENSIONS.includes(path.extname(file))) {
                console.log(
                    '\tSkipping for invalid file type',
                    path.extname(file)
                )
                continue
            }

            const filePath = path.join(directoryPath, file)

            const skipTitleAndDescriptionCheck = true
            const metadata = await processPhoto(
                filePath,
                skipTitleAndDescriptionCheck
            )

            if ('errors' in metadata) {
                console.log('\tErrors:', metadata.errors)
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
                console.log(
                    '\tNo valid galleries found for tags:',
                    metadata.tags.join(',')
                )
                errorsByFile[file] = [
                    '\tNo valid galleries found for tags:' +
                        metadata.tags.join(','),
                ]
                continue
            }
            const { dateTaken, title, description, id, src } = metadata // eslint-disable-line @typescript-eslint/no-unused-vars

            const { width, height, blurHash } =
                await encodeImageToBlurHash(filePath)

            photos[metadata.id] = {
                dateTaken,
                id,
                src,
                galleryIds,
                blurHash,
                width,
                height,
            }
        }

        if (Object.keys(errorsByFile).length > 0) {
            console.log('Errors by file:')
            console.log(errorsByFile)
        } else {
            console.log(
                Object.values(photos).length,
                'Photos processed successfully'
            )
        }

        const data = JSON.stringify({
            galleries: PUBLIC_GALLERIES_BY_TAG,
            photos,
        })

        const filePath =
            '/Users/travisbumgarner/Programming/Photography-Portfolio/ui/src/content/output.json'
        fs.writeFileSync(filePath, data)
    } catch (err) {
        console.log('Unable to scan directory: ' + err)
    }
}

const PHOTO_DIR = '/Users/travisbumgarner/Desktop/large'
main(PHOTO_DIR)
