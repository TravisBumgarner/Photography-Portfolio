import { Array as ArrayRunType, Record, Static, String } from 'runtypes'

type Tag = `#${string}`
type Account = `@${string}`

export type TagOrAccount = Tag | Account

export enum SupportedCameras {
    iPhone13 = 'Apple - iPhone 13 mini',
    CanonEOSRebel = 'Canon - Canon EOS DIGITAL REBEL XS',
    Pixel3 = 'Google - Pixel 3',
    MotoX4 = 'motorola - moto x4',
    NikonD3400 = 'NIKON CORPORATION - NIKON D3400',
    NikonD5300 = 'NIKON CORPORATION - NIKON D5300',
    NikonD7500 = 'NIKON CORPORATION - NIKON D7500',
    NikoNZ5 = 'NIKON CORPORATION - NIKON Z 5',
    Scanner1 = 'NORITSU KOKI - QSS-32_33',
    Scanner2 = 'NORITSU KOKI - EZ Controller',
    SonyRX100 = 'SONY - DSC-RX100',
    SonyA55 = 'SONY - SLT-A55V',
    SonyA290 = 'SONY - DSLR-A290',
    DJIMini3Pro = 'cameraDJI - FC3582',
    Unknown = 'undefined - undefined',
}

export type Sidecar = {
    lr?: {
        hierarchicalSubject?: string[]
    }
    dc?: {
        title?: {
            value: string
        }
        description?: {
            value: string
        }
    }
}

export const metadataRunType = Record({
    camera: String,
    lens: String,
    dateTaken: String,
    aperture: String,
    shutterSpeed: String,
    iso: String,
    focalLength: String,
    tags: ArrayRunType(String),
    title: String,
    description: String,
    id: String,
    src: String,
})
export type Metadata = Static<typeof metadataRunType>

export type ParsedData = {
    DateTimeOriginal: string
    Lens?: string
    LensModel?: string
    RawFileName: string
    Make: string
    Model: string
    ExposureTime?: number
    FNumber?: number
    ExposureProgram?: string
    ISO?: number
    FocalLength?: number
}

export type Tags = { general: TagOrAccount[]; priority: TagOrAccount[] }
