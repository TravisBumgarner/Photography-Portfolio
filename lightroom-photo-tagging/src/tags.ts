import TAGS from './tags/index'
import { MODE, TagOrAccount, Tags } from './types'

function lightroomToSocialMedia(
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

    return lightroomToSocialMedia(rest, TAGS[first])
}

const generateSocialTags = (
    lightroomTags: string[],
    mode: MODE
):
    | { errors: string[] }
    | {
          templateString: string
          tagsAndAccountsPreview: Record<string, TagOrAccount[]>
      } => {
    const errors = []

    const socialTags: Tags = { priority: [], general: [], bluesky: [] }
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

        const tags = lightroomToSocialMedia(lightroomTagParts, TAGS)
        if (!tags) {
            errors.push(`Unknown hierarchy tag: ${lightroomTag}`)
            continue
        }
        console.log('ruda', tags)
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

        socialTags.general.push(...tags.general)
        socialTags.priority.push(...tags.priority)
        socialTags.bluesky.push(...tags.bluesky)
        if (mode === MODE.INSTAGRAM) {
            tagsAndAccountsPreview[lightroomTag] = [
                ...tags.general,
                ...tags.priority,
            ]
        } else if (mode === MODE.BLUESKY) {
            tagsAndAccountsPreview[lightroomTag] = [
                ...tags.bluesky,
                ...([
                    '#art',
                    '#photography',
                    '#photooftheday',
                ] as TagOrAccount[]),
            ]
        } else {
            throw new Error(`Invalid mode: ${mode}`)
        }
    }

    if (errors.length > 0) {
        return { errors }
    }
    let socialTagsSet: Set<TagOrAccount>
    if (mode === MODE.INSTAGRAM) {
        socialTagsSet = new Set([...socialTags.priority, ...socialTags.general])
    } else if (mode === MODE.BLUESKY) {
        socialTagsSet = new Set([...socialTags.bluesky])
    } else {
        throw new Error(`Invalid mode: ${mode}`)
    }

    // Instagram only allows 30 tags. We will prioritize priority tags which are known to be tags actively monitored.
    const limit30 = [...socialTagsSet].slice(0, 30)

    const templateString = limit30.join(' ')
    if (
        '##' in socialTags ||
        '@@' in socialTags ||
        '#@' in socialTags ||
        '@#' in socialTags
    ) {
        return {
            errors: ['Invalid tag or account name with ##, @@, #@, or @#'],
        }
    }

    return { templateString, tagsAndAccountsPreview }
}

export default generateSocialTags
