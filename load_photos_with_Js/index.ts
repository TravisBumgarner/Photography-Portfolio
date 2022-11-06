import fs from 'fs'
import path from 'path'

import exifr from 'exifr'
import { v5 as uuidv5 } from 'uuid'

type LightroomKey =
    | 'CameraType'
    | 'ContentType'
    | 'Gallery'
    | 'Location'
    | 'IsBackgroundPhoto'

type ParsedData = {
    DateCreated: string // '2022-04-13T10:43:36.589+02:00',
    // LensInfo: [1.5399999618512084, 5.1, 1.6, 2.4],
    Lens: string // 'iPhone 13 mini back dual wide camera 5.1mm f/1.6',
    // LensModel: 'iPhone 13 mini back dual wide camera 5.1mm f/1.6',
    // PreservedFileName: '2022-04-13 10.43.36.jpg',
    RawFileName: string //'2022-04-13 10.43.36.jpg',
    // hierarchicalSubject: [
    //     'CameraType|Digital',
    //     'ContentType|snapshot',
    //     'Gallery|2022',
    //     'Location|France'
    // ],
    hierarchicalSubject: string[]
    Make: string //'Apple',
    Model: string // 'iPhone 13 mini',
    ExposureTime: number // 0.0008695652173913044,
    FNumber: number // 1.6,
    ExposureProgram: string // 'Normal program',
    ISO: number // 50,
    // ExifVersion:  '2.3.2',
    // ShutterSpeedValue: 10.167418,
    // ApertureValue: 1.356144,
    FocalLength: number //5.1,
    // LensMake: 'Apple'
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

const processHierarchicalSubject = (hierarchicalSubject: ParsedData['hierarchicalSubject']) => {
    // This function will cause failures further down the line with the lie of `as Record<LightroomKey, string>
    // In that case need to update Lightroom's Metadata


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

const formatLens = (lens: string) => {
    const lookup: Record<string, string> = {
        'iPhone 13 mini back dual wide camera 5.1mm f/1.6': ''
    }

    return lookup[lens] || lens
}

const processFilm = () => {

}

const processPhoto = async (file: string): Promise<ProcessedPhoto> => {
    const data: ParsedData = await exifr.parse(file, true)
    console.log(data)
    const { Location, Gallery, ContentType, CameraType, IsBackgroundPhoto } = processHierarchicalSubject(data.hierarchicalSubject)
    // For when generating the metadata isn't the same as all the other image types.
    let metadataOverrides: Partial<ProcessedPhoto> = {}

    switch (`${data.Make} - ${data.Model}`) {
        // Film Scanner
        case 'NORITSU KOKI - EZ Controller': {
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
        case 'SONY - DSLR-A290': {
            metadataOverrides = {
                camera: 'Sony A290'
            }
            break
        }
        case 'SONY - SLT-A55V': {
            metadataOverrides = {
                camera: 'Sony A55'
            }
            break
        }
        case 'SONY - DSC-RX100': {
            metadataOverrides = {
                camera: 'Sony RX100'
            }
            break
        }
        case 'NIKON CORPORATION - NIKON D5300':
        case 'NIKON CORPORATION - NIKON D3400':
        case 'NIKON CORPORATION - NIKON D7500': {
            const modelToCamera: Record<string, string> = {
                'NIKON D5300': 'Nikon D5300',
                'NIKON D3400': 'Nikon D3400',
                'NIKON D7500': 'Nikon D7500'
            }

            metadataOverrides = {
                camera: modelToCamera[data.Model]
            }
            break
        }
        case 'Apple - iPhone 13 mini': {
            metadataOverrides = {
                camera: 'iPhone 13',
                lens: ''
            }
            break
        }
    }

    const results = {
        id: generatePhotoId(data.RawFileName, data.DateCreated),
        src: data.RawFileName,
        location: Location,
        gallery: Gallery,
        contentType: ContentType,
        cameraType: CameraType,
        camera: `${data.Make} - ${data.Model}`,
        lens: formatLens(data.Lens),
        iso: `${data.ISO}`,
        shutterSpeed: formatShutterSpeed(data.ExposureTime),
        aperture: `${data.FNumber}`,
        isBackgroundPhoto: IsBackgroundPhoto,
        focalLength: `${data.FocalLength}`,
        categories: [],
        dateTaken: data.DateCreated,
        ...metadataOverrides
    }

    return results
}

type Gallery = {
    title: string,
    slug: string,
    contentType: string
}

const VALID_EXTENSIONS = [
    'jpg'
]

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
    }
}

processPhotos()