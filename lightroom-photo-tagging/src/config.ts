import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

function notNull(key: string) {
    const value = process.env[key]
    if (!value) {
        throw Error(`Missing environment variable: ${key}`)
    }

    return value as string
}

const config = {
    debugMode: notNull('DEBUG_MODE') === 'true',
    socialPlatform: notNull('SOCIAL_PLATFORM'),
    ingestPath: notNull('INGEST_PATH'),
}

export default config
