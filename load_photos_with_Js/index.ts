import fs from 'fs'
import path from 'path'

import * as exifr from 'exifr'
import { v5 as uuidv5 } from 'uuid'

type LightroomKey =
    | 'CameraType'
    | 'ContentType'
    | 'Gallery'
    | 'Location'
    | 'IsBackgroundPhoto'

type ParsedData = {
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

type Sidecar = {
    lr: {
        hierarchicalSubject: string[]
    }
}

enum SupportedCameras {
    'Apple - iPhone 13 mini' = 'Apple - iPhone 13 mini',
    'Canon - Canon EOS DIGITAL REBEL XS' = 'Canon - Canon EOS DIGITAL REBEL XS',
    'Google - Pixel 3' = 'Google - Pixel 3',
    'motorola - moto x4' = 'motorola - moto x4',
    'NIKON CORPORATION - NIKON D3400' = 'NIKON CORPORATION - NIKON D3400',
    'NIKON CORPORATION - NIKON D5300' = 'NIKON CORPORATION - NIKON D5300',
    'NIKON CORPORATION - NIKON D7500' = 'NIKON CORPORATION - NIKON D7500',
    'NIKON CORPORATION - NIKON Z 5' = 'NIKON CORPORATION - NIKON Z 5',
    'NORITSU KOKI - QSS-32_33' = 'NORITSU KOKI - QSS-32_33',
    'NORITSU KOKI - EZ Controller' = 'NORITSU KOKI - EZ Controller',
    'SONY - DSC-RX100' = 'SONY - DSC-RX100',
    'SONY - SLT-A55V' = 'SONY - SLT-A55V',
    'SONY - DSLR-A290' = 'SONY - DSLR-A290',
    'undefined - undefined' = 'undefined - undefined',
}

type ProcessedPhoto = {
    id: string,
    src: string,
    gallery: string
    categories: string[],
    location: string
    contentType: string
    cameraType: string
    camera: string,
    lens: string,
    dateTaken: string,
    aperture: string,
    shutterSpeed: string,
    iso: string,
    focalLength: string,
    isBackgroundPhoto: string // '0' | '1'
}


const processHierarchicalSubject = (hierarchicalSubject: Sidecar['lr']['hierarchicalSubject'] | undefined): Record<LightroomKey, string> | null => {
    // This function will cause failures further down the line with the lie of `as Record<LightroomKey, string>
    // In that case need to update Lightroom's Metadata
    if (!hierarchicalSubject) return null

    const augmentedData = [...hierarchicalSubject]
    const isBackgroundPhotoIndex = augmentedData.indexOf('IsBackgroundPhoto')
    if (isBackgroundPhotoIndex > -1) {
        augmentedData[isBackgroundPhotoIndex] = 'IsBackgroundPhoto|1'
    } else {
        augmentedData.push('IsBackgroundPhoto|0')
    }

    return augmentedData
        .reduce((accum, entry) => {
            const [key, value] = entry.split('|')
            accum[(key) as LightroomKey] = value
            return accum
        }, {} as Record<LightroomKey, string>)
}

const generatePhotoId = (filename: string, date_taken: string) => {
    const PHOTOS_NAMESPACE = 'deadbeef-beef-491e-99b0-da01ff1f3341';

    return uuidv5(`${filename} ${date_taken}`, PHOTOS_NAMESPACE);
}

const formatShutterSpeed = (shutterSpeed: number) => {
    if (shutterSpeed < 1) {
        return `1/${1 / shutterSpeed}s`
    } else {
        return `${shutterSpeed}s`
    }
}

const formatAperture = (focalLength: number) => {
    return `\u0192/${focalLength.toFixed(1)}`
}

const formatLens = (possibleLenses: (undefined | string)[]) => {
    // Lens has different name depending ont he camera.

    const lens = possibleLenses.filter(l => l !== undefined)[0]
    // if (lens === undefined) throw new Error('Need new lens name')

    return lens || ''
}

const processPhoto = async (file: string): Promise<ProcessedPhoto | null> => {
    let data: ParsedData
    const sidecar = await exifr.sidecar(file) as unknown as Sidecar

    try {
        data = await exifr.parse(file)
        console.log(data)
    } catch {
        return null
    }

    const lightroomTags = processHierarchicalSubject(sidecar.lr.hierarchicalSubject)
    if (!lightroomTags) {
        console.log('\tSkipping for no Lightroom tags')
        return null
    }

    const { Location, Gallery, ContentType, CameraType, IsBackgroundPhoto } = lightroomTags

    // For when generating the metadata isn't the same as all the other image types.
    let metadataOverrides: Partial<ProcessedPhoto> = {}

    const camera = `${data.Make} - ${data.Model}` as string as SupportedCameras // Switch case default will catch if this errors. 

    switch (camera) {
        // Film Scanner
        case SupportedCameras['NORITSU KOKI - QSS-32_33']:
        case SupportedCameras['NORITSU KOKI - EZ Controller']: {
            metadataOverrides = {
                camera: '',
                lens: '',
                iso: '',
                shutterSpeed: '',
                aperture: '',
                focalLength: '',
                dateTaken: ''
            }
            break
        }
        case SupportedCameras['SONY - DSLR-A290']: {
            metadataOverrides = {
                camera: 'Sony A290'
            }
            break
        }
        case SupportedCameras['SONY - SLT-A55V']: {
            metadataOverrides = {
                camera: 'Sony A55'
            }
            break
        }
        case SupportedCameras['SONY - DSC-RX100']: {
            metadataOverrides = {
                camera: 'Sony RX100'
            }
            break
        }
        case SupportedCameras['NIKON CORPORATION - NIKON D5300']:
        case SupportedCameras['NIKON CORPORATION - NIKON D3400']:
        case SupportedCameras['NIKON CORPORATION - NIKON Z 5']:
        case SupportedCameras['NIKON CORPORATION - NIKON D7500']: {
            const modelToCamera: Record<string, string> = {
                'NIKON D5300': 'Nikon D5300',
                'NIKON D3400': 'Nikon D3400',
                'NIKON D7500': 'Nikon D7500',
                'NIKON Z 5': 'Nikon Z5'
            }

            metadataOverrides = {
                camera: modelToCamera[data.Model]
            }
            break
        }
        case SupportedCameras['Apple - iPhone 13 mini']: {
            metadataOverrides = {
                camera: 'iPhone 13',
                lens: ''
            }
            break
        }
        case SupportedCameras['undefined - undefined']: {
            // Unclear how these ended up in lightroom
            metadataOverrides = {
                camera: '',
                iso: '',
                shutterSpeed: '',
                aperture: '',
                focalLength: '',
                dateTaken: ''
            }
            break
        }
        case SupportedCameras['motorola - moto x4']: {
            metadataOverrides = {
                lens: ''
            }
            break
        }
        case SupportedCameras['Canon - Canon EOS DIGITAL REBEL XS']: {
            metadataOverrides = {
            }
            break
        }
        case SupportedCameras['Google - Pixel 3']: {
            metadataOverrides = {
                lens: ''
            }
            break
        }
        default: {
            throw Error('unsupported camera' + camera)
            break
        }
    }

    const results = {
        id: generatePhotoId(data.RawFileName, data.DateTimeOriginal),
        src: file,
        location: Location,
        gallery: Gallery,
        contentType: ContentType,
        cameraType: CameraType,
        camera: `${data.Make} - ${data.Model}`,
        lens: formatLens([data.Lens, data.LensModel]),
        iso: data.ISO ? `ISO ${data.ISO}` : '',
        shutterSpeed: data.ExposureTime ? formatShutterSpeed(data.ExposureTime) : '',
        aperture: data.FNumber ? formatAperture(data.FNumber) : '',
        isBackgroundPhoto: IsBackgroundPhoto,
        focalLength: data.FocalLength ? `${data.FocalLength}mm` : '',
        categories: [],
        dateTaken: data.DateTimeOriginal,
        ...metadataOverrides
    }
    const missingKeys = Object.keys(results).filter((key: keyof typeof results) => results[key] === undefined)
    if (missingKeys.length > 0) {
        console.log(`\tMissing values: ${JSON.stringify(missingKeys)}, they were probably not exported from Lightroom`)
    }
    return results
}

type Gallery = {
    title: string,
    slug: string,
    contentType: string
}

const VALID_EXTENSIONS = ['jpg']

const processPhotos = async () => {
    const PHOTO_DIR = 'large'

    const photos = {}
    const galleries: Record<string, Gallery> = {}
    const locations: string[] = []

    const files = fs.readdirSync(PHOTO_DIR)

    for (let file of files) {
        console.log(file)
        const extension = file.split('.').slice(-1)[0]
        if (!VALID_EXTENSIONS.includes(extension)) {
            console.log('\tSkipping for invalid file type')
            continue
        }

        const result = await processPhoto(path.join(PHOTO_DIR, file))
        if (result === null) console.log('skipping', file)
        else {
            console.log('\t', 'success')
        }
    }
}

processPhotos()