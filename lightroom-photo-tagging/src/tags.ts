import TAGS from './tags/index'
import { TagOrAccount, Tags } from './types'

function lightroomTagToInstagramTags(
    hierarchyTagParts: string[],
    TAGS: any
): Tags | null {
    if (hierarchyTagParts.length === 0) {
        return TAGS ? TAGS : null
    }

    const [first, ...rest] = hierarchyTagParts
    if (!TAGS[first]) {
        return null
    }

    return lightroomTagToInstagramTags(rest, TAGS[first])
}

const lightroomTagsToInstragramTemplateString = (
    lightroomTags: string[]
):
    | { errors: string[] }
    | {
        templateString: string
        tagsAndAccountsPreview: Record<string, TagOrAccount[]>
    } => {
    const errors = []

    const instagramTags: Tags = { priority: [], general: [] }
    const tagsAndAccountsPreview: Record<string, TagOrAccount[]> = {}

    for (let lightroomTag of lightroomTags) {
        if (!lightroomTag.includes('cameracoffeewander')) {
            console.log(
                "\t\tSkipping tag that doesn't include cameracoffeewander: ",
                lightroomTag
            )
            continue
        }

        lightroomTag = lightroomTag.replace('cameracoffeewander|', '')

        const lightroomTagParts = [...lightroomTag.split('|')]

        const tags = lightroomTagToInstagramTags(lightroomTagParts, TAGS)
        if (!tags) {
            errors.push(`Unknown hierarchy tag: ${lightroomTag}`)
            continue
        }

        if (tags.general.length === 0 && tags.priority.length === 0) {
            errors.push(
                `No tags or accounts found for hierarchy tag: ${lightroomTag}`
            )
            continue
        }

        if (
            [...tags.priority, ...tags.general].some(tag =>
                (tag as unknown as string).includes(' ')
            )
        )
            errors.push(`Tag contains space: "${lightroomTag}"`)

        instagramTags.general.push(...tags.general)
        instagramTags.priority.push(...tags.priority)
        tagsAndAccountsPreview[lightroomTag] = [
            ...tags.general,
            ...tags.priority,
        ]
    }

    if (errors.length > 0) {
        return { errors }
    }

    const instagramTagsSet = new Set([
        ...instagramTags.priority,
        ...instagramTags.general,
    ])

    // Instagram only allows 30 tags. We will prioritize priority tags which are known to be tags actively monitored.
    const limit30 = [...instagramTagsSet].slice(0, 30)

    const templateString = limit30.join(' ')
    if (
        '##' in instagramTags ||
        '@@' in instagramTags ||
        '#@' in instagramTags ||
        '@#' in instagramTags
    ) {
        return {
            errors: ['Invalid tag or account name with ##, @@, #@, or @#'],
        }
    }

    return { templateString, tagsAndAccountsPreview }
}

export default lightroomTagsToInstragramTemplateString
