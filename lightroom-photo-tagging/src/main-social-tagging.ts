import fs from 'fs'
import path from 'path'
import processPhoto from './metadata'
import lightroomTagsToInstragramTemplateString from './tags'
import createTemplate from './template'

const main = async (directoryPath: string) => {
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

    try {
        const files = fs.readdirSync(directoryPath)

        console.log('Gathering tags...')
        for (const file of files) {
            const filePath = path.join(directoryPath, file)
            console.log('\t', filePath)

            const metadata = await processPhoto(filePath)

            if ('errors' in metadata) {
                errorsByFile[file] = metadata.errors
                continue
            }

            const accountsAndTags = lightroomTagsToInstragramTemplateString(
                metadata.tags
            )
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
    } catch (err) {
        console.log('Unable to scan directory: ' + err)
    }
}

main('/Users/travisbumgarner/Desktop/cameracoffeewander_template_ingest')
