import { Metadata, TagOrAccount } from './types'

const createTemplate = ({ metadata, tagsAndAccounts }: { metadata: Metadata; tagsAndAccounts: TagOrAccount[] }) => {
    const line1 = `${metadata.title.trim()} ${metadata.dateTaken ? `${metadata.dateTaken}` : ''}`.trim()
    const line2 = `${metadata.description.trim()}`
    const line3 = `The Gear - ${[metadata.camera, metadata.lens].filter(a => a).join(', ')}`
    const line4 = `The Setup - ${metadata.shutterSpeed}, ${metadata.aperture}, ${metadata.focalLength} focal length`
    const line5 = `${tagsAndAccounts.map(tag => tag.toString()).join(', ')}`

    return [line1, line2, line3, line4, line5]
        .map(a => a.trim())
        .filter(a => a)
        .join('\n')
}

export default createTemplate
