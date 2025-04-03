import fs from 'fs'
import path from 'path'
import config from './config'
import processPhoto from './metadata'
import generateTags from './tags'
import createTemplate from './template'

const VALID_EXTENSIONS = ['.avif', '.jpg', '.jpeg', '.png']

const main = async () => {
    const errorsByFile: Record<string, string[]> = {}

    try {
        const files = fs.readdirSync(config.ingestPath)

        files.forEach(file => {
            if (path.extname(file) === '.txt') {
                try {
                    fs.unlinkSync(path.join(config.ingestPath, file))
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

    const files = fs.readdirSync(config.ingestPath)

    console.log('Gathering tags...')
    for (const file of files) {
        if (!VALID_EXTENSIONS.includes(path.extname(file))) {
            console.log('\tSkipping for invalid file type', path.extname(file))
            continue
        }

        const filePath = path.join(config.ingestPath, file)
        console.log('\t', filePath)

        const metadata = await processPhoto(filePath)

        if ('errors' in metadata) {
            errorsByFile[file] = metadata.errors
            continue
        }

        const accountsAndTags = generateTags(metadata.tags)
        if ('errors' in accountsAndTags) {
            errorsByFile[file] = accountsAndTags.errors
            continue
        }

        const template = createTemplate({
            metadata,
            accountsAndTagsTemplateString: accountsAndTags.templateString,
            tagsAndAccountsPreview: accountsAndTags.tagsAndAccountsPreview,
        })

        const fileNameWithoutExt = path.parse(file).name
        fs.writeFileSync(
            path.join(config.ingestPath, fileNameWithoutExt + '.txt'),
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

main()
