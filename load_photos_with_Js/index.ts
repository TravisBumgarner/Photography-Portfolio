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
    categories: [],
    location: string
    contentType: string
    cameraType: string
    make: string,
    model: string
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

    const { Location, Gallery, ContentType, CameraType, IsBackgroundPhoto } = processHierarchicalSubject(data.hierarchicalSubject)

    // For when generating the metadata isn't the same as all the other image types.
    let metadataOverrides: Partial<ProcessedPhoto> = {}
    switch (data.Make) {
        // Film Scanner
        case 'NORITSU KOKI': {
            metadataOverrides = {
                make: '',
                model: '',
                lens: '',
                iso: '',
                shutterSpeed: '',
                aperture: '',
                focalLength: '',
                dateTaken: ''
            }
            break
        }
    }
    
    return {
        id: generatePhotoId(data.RawFileName, data.DateCreated),
        src: data.RawFileName,
        location: Location,
        gallery: Gallery,
        contentType: ContentType,
        cameraType: CameraType,
        make: data.Make,
        model: data.Model,
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
}

type Gallery = {
    title: string,
    slug: string,
    contentType: string
}

const processPhotos = () => {
    const PHOTO_DIR = 'large'

    const photos = {}
    const galleries: Record<string, Gallery> = {}
    const locations: string[] = []

    fs.readdir(PHOTO_DIR, (err, files) => {
        files.forEach(async file => {
            const result = await processPhoto(path.join(PHOTO_DIR, file))
            console.log(result)
        });
    });
}

processPhotos()