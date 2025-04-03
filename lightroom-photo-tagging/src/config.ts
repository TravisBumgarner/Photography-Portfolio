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
    ingestPath: notNull('INGEST_PATH'),
}

export default config
