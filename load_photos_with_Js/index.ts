import fs from 'fs'
import path from 'path'

import exifr from 'exifr'

type LightroomKey =
    | 'CameraType'
    | 'ContentType'
    | 'Gallery'
    | 'Location'

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
    hierarchicalSubject: `${LightroomKey}|${string}`[]
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
    isHomeBackground: boolean
}

const processHierarchicalSubject = (hierarchicalSubject: ParsedData['hierarchicalSubject']) => {
    return hierarchicalSubject.reduce((accum, entry) => {
        const [key, value] = entry.split('|')
        accum[(key) as LightroomKey] = value
        return accum
    }, {} as Record<LightroomKey, string>)
}

const processPhoto = async (file: string): Promise<ProcessedPhoto> => {
    const data: ParsedData = await exifr.parse(file, true)

    const { Location, Gallery, ContentType, CameraType } = processHierarchicalSubject(data.hierarchicalSubject)

    return {
        id: '',
        src: data.RawFileName,
        location: Location,
        gallery: Gallery,
        contentType: ContentType,
        cameraType: CameraType,
        make: data.Make,
        model: data.Model,
        lens: data.Lens,
        iso: `${data.ISO}`,
        shutterSpeed: `${data.ExposureTime}`,
        aperture: `${data.FNumber}`,
        isHomeBackground: false,
        focalLength: `${data.FocalLength}`,
        categories: [],
        dateTaken: data.DateCreated
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