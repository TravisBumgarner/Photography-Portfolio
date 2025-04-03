import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

function notNull(key: string) {
    const value = process.env[key]
    if (!value) {
        throw Error(`Missing environment variable: ${key}`)
    }

    return value as string
}

function isOneOf(key: string, validValues: string[]) {
    const value = process.env[key]
    if (!value) {
        throw Error(`Missing environment variable: ${key}`)
    }

    if (!validValues.includes(value)) {
        throw Error(`Invalid environment variable: ${key}`)
    }

    return value as string
}

const config = {
    debugMode: notNull('DEBUG_MODE') === 'true',
    socialPlatform: isOneOf('SOCIAL_PLATFORM', ['instagram', 'bluesky']),
    socialIngestPath: notNull('SOCIAL_INGEST_PATH'),
    portfolioIngestPath: notNull('PORTFOLIO_INGEST_PATH'),
}

export default config
