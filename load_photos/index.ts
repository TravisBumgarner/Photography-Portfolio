import fs from 'fs'
import path from 'path'

import * as exifr from 'exifr'
import { v5 as uuidv5 } from 'uuid'

const PHOTO_DIR = 'large'
const MODE = 'private' // Change to `all` to include all photos in the gallery, including background photos.

const DEBUG = false // to get logs.

type Gallery = {
    title: string,
    slug: string
}

// new Gallery IDs are set in Lightroom
const GALLERIES: Record<string, Gallery> = {
    '2014': {
        "title": "2014 Snapshots",
        "slug": "2014",
    },
    '2015': {
        "title": "2015 Snapshots",
        "slug": "2015",
    },
    '2016': {
        "title": "2016 Snapshots",
        "slug": "2016",
    },
    '2017': {
        "title": "2017 Snapshots",
        "slug": "2017",
    },
    '2018': {
        "title": "2018 Snapshots",
        "slug": "2018",
    },
    '2019': {
        "title": "2019 Snapshots",
        "slug": "2019",
    },
    '2020': {
        "title": "2020 Snapshots",
        "slug": "2020",
    },
    '2021': {
        "title": "2021 Snapshots",
        "slug": "2021",
    },
    '2022': {
        "title": "2022 Snapshots",
        "slug": "2022",
    },
    '2x3x4': {
        "title": "2x3x4",
        "slug": "2x3x4",
    },
    'hinds-and-trusty-wedding': {
        "title": "Hinds & Trusty Wedding",
        "slug": "hinds-and-trusty-wedding",
    },
    'architecture-of-mexico': {
        "title": "Architecture of Mexico",
        "slug": "architecture-of-mexico",
    },
    'the-vw-beetle-spectrum': {
        "title": "The VW Beetle Spectrum",
        "slug": "the-vw-beetle-spectrum",
    },
    'colors-of-penonome-panama': {
        "title": "Colors of Penonom\u00e9 Panama",
        "slug": "colors-of-penonome-panama",
    },
    'ricky-and-tif': {
        "title": "Ricky and Tif's Wedding",
        "slug": "ricky-and-tif",
    },
}

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

type Photo = {
    id: string,
    src: string,
    gallery: string
    location: string
    camera: string,
    lens: string,
    dateTaken: string,
    aperture: string,
    shutterSpeed: string,
    iso: string,
    focalLength: string,
    isBackgroundPhoto: boolean
}


type LightroomMetadata = {
    CameraType: string,
    Gallery: string,
    Location: string,
    IsBackgroundPhoto: boolean,
}

const processHierarchicalSubject = (hierarchicalSubject: Sidecar['lr']['hierarchicalSubject'] | undefined): LightroomMetadata | null => {
    // This function will cause failures further down the line with the lie of `as Record<LightroomKey, string>
    // In that case need to update Lightroom's Metadata
    console.log(hierarchicalSubject)
    if (!hierarchicalSubject) return null
    console.log('hierarchicalSubject', typeof hierarchicalSubject)
    const partialKeys = hierarchicalSubject
        .filter(key => !('IsBackgroundPhoto' === key)) // Process separately because it's not a <key, value>
        .reduce((accum, entry) => {
            const [key, value] = entry.split('|')
            accum[key] = value
            return accum
        }, {} as Record<string, string>)

    return {
        ...partialKeys,
        IsBackgroundPhoto: hierarchicalSubject.indexOf('IsBackgroundPhoto') > -1
    } as LightroomMetadata
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

    return lens || ''
}

const processPhoto = async (file: string): Promise<Photo | null> => {
    let data: ParsedData
    const sidecar = await exifr.sidecar(file) as unknown as Sidecar

    try {
        data = await exifr.parse(file)
        if (DEBUG) console.log(data)
    } catch {
        return null
    }

    const hierarchicalSubject = Array.isArray(sidecar.lr.hierarchicalSubject) ? sidecar.lr.hierarchicalSubject : [sidecar.lr.hierarchicalSubject]

    const lightroomTags = processHierarchicalSubject(hierarchicalSubject)
    if (!lightroomTags) {
        console.log('\tSkipping for no Lightroom tags')
        return null
    }

    const { Location, Gallery, IsBackgroundPhoto } = lightroomTags
    // For when generating the metadata isn't the same as all the other image types.
    let metadataOverrides: Partial<Photo> = {}

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
                camera: 'Sony A55',
                lens: data.LensModel === '----' ? '' : data.LensModel // Some lens used resulted in this.
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
        src: file.replace(`${PHOTO_DIR}/`, ''),
        location: Location,
        gallery: Gallery,
        camera: `${data.Make} - ${data.Model}`,
        lens: formatLens([data.Lens, data.LensModel]),
        iso: data.ISO ? `ISO ${data.ISO}` : '',
        shutterSpeed: data.ExposureTime ? formatShutterSpeed(data.ExposureTime) : '',
        aperture: data.FNumber ? formatAperture(data.FNumber) : '',
        isBackgroundPhoto: IsBackgroundPhoto,
        focalLength: data.FocalLength ? `${data.FocalLength}mm` : '',
        dateTaken: data.DateTimeOriginal,
        ...metadataOverrides
    }
    const missingKeys = Object.keys(results).filter((key: keyof typeof results) => results[key] === undefined)
    if (missingKeys.length > 0) {
        console.log(`${file} Missing values: ${JSON.stringify(missingKeys)}, they were probably not exported from Lightroom`)
    }
    return results
}

const VALID_EXTENSIONS = ['jpg']

const processPhotos = async (mode: 'all' | 'private') => {
    const photos: Record<string, Photo> = {}
    const galleries = GALLERIES

    const files = fs.readdirSync(PHOTO_DIR)

    for (let file of files) {
        const extension = file.split('.').slice(-1)[0]
        if (!VALID_EXTENSIONS.includes(extension)) {
            console.log('\tSkipping for invalid file type')
            continue
        }

        const result = await processPhoto(path.join(PHOTO_DIR, file))
        if (result === null) console.log('skipping', file)
        else {
            photos[result.id] = result
            if (DEBUG) console.log(result)
        }
    }

    let data
    if (mode === 'all') {
        data = JSON.stringify({ galleries, photos });
    } else {
        const galleryIds = new Set([...Object.values(photos).map(photo => photo.gallery)])
        if (galleryIds.size !== 1) {
            throw new Error('Only one gallery allowed for private photos')
        }

        const galleryId = galleryIds.values().next().value

        data = JSON.stringify({ gallery: galleries[galleryId], photos })
    }
    fs.writeFileSync('output.json', data);
}

processPhotos(MODE)