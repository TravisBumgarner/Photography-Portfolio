import fs from 'fs'
import path from 'path'
import config from './config'
import processPhoto from './metadata'
import generateTags from './tags'
import createTemplate from './template'

const VALID_EXTENSIONS = ['.avif', '.jpg', '.jpeg', '.png']

const clearDirOfTxtFiles = () => {
    const files = fs.readdirSync(config.socialIngestPath)
    files.forEach(file => {
        if (path.extname(file) === '.txt') fs.unlinkSync(path.join(config.socialIngestPath, file))
    })
}

const main = async () => {
    const errorsByFile: Record<string, string[]> = {}

    clearDirOfTxtFiles()

    const files = fs.readdirSync(config.socialIngestPath)

    console.log('Gathering tags...')
    for (const file of files) {
        if (!VALID_EXTENSIONS.includes(path.extname(file))) {
            console.log('\tSkipping for invalid file type', path.extname(file))
            continue
        }

        const filePath = path.join(config.socialIngestPath, file)
        console.log('\t', filePath)

        const metadata = await processPhoto(filePath)

        if ('errors' in metadata) {
            errorsByFile[file] = metadata.errors
            continue
        }

        const result = generateTags(metadata.tags)
        if ('errors' in result) {
            errorsByFile[file] = result.errors
            continue
        }

        const template = createTemplate({
            metadata,
            tagsAndAccounts: result,
        })

        const fileNameWithoutExt = path.parse(file).name
        fs.writeFileSync(path.join(config.socialIngestPath, fileNameWithoutExt + '.txt'), template)
    }

    if (Object.keys(errorsByFile).length > 0) {
        console.log('Errors by file:')
        console.log(errorsByFile)
    }
}

main()
