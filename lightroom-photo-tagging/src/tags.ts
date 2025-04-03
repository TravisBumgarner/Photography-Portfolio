import config from './config'
import TAGS from './tags/index'
import { TagOrAccount, Tags } from './types'

function lightroomToSocialMedia(hierarchyTagParts: string[], TAGS: any): Tags | null {
    if (hierarchyTagParts.length === 0) {
        return TAGS ? TAGS : null
    }

    const [first, ...rest] = hierarchyTagParts
    if (!TAGS[first]) {
        return null
    }

    return lightroomToSocialMedia(rest, TAGS[first])
}

const hasInvalidTags = (tags: TagOrAccount[]) => {
    return tags.some(tag => {
        if (tag.startsWith('##')) return true
        if (tag.startsWith('@@')) return true
        if (tag.startsWith('#@')) return true
        if (tag.startsWith('@#')) return true
        if (tag.includes(' ')) return true
        return false
    })
}

const generateSocialTagsAllPhotos = (lightroomTags: string[]): { errors: string[] } | TagOrAccount[] => {
    const errors = []
    const socialTags: Tags = { priority: [], general: [], bluesky: [] }

    for (let lightroomTag of lightroomTags) {
        if (!lightroomTag.includes('cameracoffeewander')) {
            if (config.debugMode) {
                console.log("\t\tSkipping tag that doesn't include cameracoffeewander: ", lightroomTag)
            }
            continue
        }

        lightroomTag = lightroomTag.replace('cameracoffeewander|', '')

        const lightroomTagParts = [...lightroomTag.split('|')]

        const tags = lightroomToSocialMedia(lightroomTagParts, TAGS)
        if (!tags) {
            errors.push(`Unknown hierarchy tag: ${lightroomTag}`)
            continue
        }

        if (tags.general.length === 0 && tags.priority.length === 0) {
            errors.push(`No tags or accounts found for hierarchy tag: ${lightroomTag}`)
            continue
        }

        socialTags.general.push(...tags.general)
        socialTags.priority.push(...tags.priority)
        socialTags.bluesky.push(...tags.bluesky)
    }

    if (errors.length > 0) {
        return { errors }
    }

    let socialTagsSet: Set<TagOrAccount>
    if (config.socialPlatform === 'instagram') {
        socialTagsSet = new Set([...socialTags.priority, ...socialTags.general])
    } else if (config.socialPlatform === 'bluesky') {
        socialTagsSet = new Set([...socialTags.bluesky])
    } else {
        throw new Error(`Invalid mode: ${config.socialPlatform}`)
    }

    // Instagram only allows 30 tags. We will prioritize priority tags which are known to be tags actively monitored.
    const limit30 = [...socialTagsSet].slice(0, 30)
    if (hasInvalidTags(limit30)) {
        return {
            errors: ['Invalid tag or account name with ##, @@, #@, or @#'],
        }
    }

    return limit30
}

export default generateSocialTagsAllPhotos
