import fs from 'fs'
import path from 'path'
import processPhoto from './metadata'
import generateTags from './tags'
import createTemplate from './template'
import { MODE } from './types'

const VALID_EXTENSIONS = ['.avif', '.jpg', '.jpeg', '.png']

const main = async (directoryPath: string, mode: MODE) => {
    const errorsByFile: Record<string, string[]> = {}

    try {
        const files = fs.readdirSync(directoryPath)

        files.forEach(file => {
            if (path.extname(file) === '.txt') {
                try {
                    fs.unlinkSync(path.join(directoryPath, file))
                    console.log(`Deleted file: ${file}`)
                } catch (err) {
                    console.log(`Error deleting file: ${file}`)
                }
            }
        })
    } catch (err) {
        console.log('Unable to scan directory: ' + err)
    }

    let templates = ''

    const files = fs.readdirSync(directoryPath)

    console.log('Gathering tags...')
    for (const file of files) {
        if (!VALID_EXTENSIONS.includes(path.extname(file))) {
            console.log('\tSkipping for invalid file type', path.extname(file))
            continue
        }

        const filePath = path.join(directoryPath, file)
        console.log('\t', filePath)

        const metadata = await processPhoto(filePath)

        if ('errors' in metadata) {
            errorsByFile[file] = metadata.errors
            continue
        }

        const accountsAndTags = generateTags(metadata.tags, mode)
        if ('errors' in accountsAndTags) {
            errorsByFile[file] = accountsAndTags.errors
            continue
        }

        const template = createTemplate({
            metadata,
            accountsAndTagsTemplateString: accountsAndTags.templateString,
            tagsAndAccountsPreview: accountsAndTags.tagsAndAccountsPreview,
            mode,
        })

        const fileNameWithoutExt = path.parse(file).name
        fs.writeFileSync(
            path.join(directoryPath, fileNameWithoutExt + '.txt'),
            template
        )

        templates += template
        templates += '\n\n\n\n\n\n\n\n\n\n'
    }

    if (Object.keys(errorsByFile).length > 0) {
        console.log('Errors by file:')
        console.log(errorsByFile)
    } else {
        console.log(templates)
    }
}

main(
    '/Users/travisbumgarner/Desktop/cameracoffeewander_template_ingest',
    MODE.INSTAGRAM
)
