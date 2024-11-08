import { Metadata, ParsedData, SupportedCameras } from './types'

const metadataOverride = (
    camera: SupportedCameras,
    data: ParsedData
): Partial<Metadata> => {
    let metadataOverrides: Partial<Metadata> = {}
    switch (camera) {
        // Film Scanner
        case SupportedCameras.Scanner1:
        case SupportedCameras.Scanner2: {
            metadataOverrides = {
                camera: 'REPLACE',
                lens: 'REPLACE',
                iso: 'REPLACE',
                shutterSpeed: 'REPLACE',
                aperture: 'REPLACE',
                focalLength: 'REPLACE',
                dateTaken: 'REPLACE',
            }
            break
        }
        case SupportedCameras.SonyA290: {
            metadataOverrides = {
                camera: 'Sony A290',
            }
            break
        }
        case SupportedCameras.SonyA55: {
            metadataOverrides = {
                camera: 'Sony A55',
                lens: data.LensModel === '----' ? '' : data.LensModel, // Some lens used resulted in this.
            }
            break
        }
        case SupportedCameras.SonyRX100: {
            metadataOverrides = {
                camera: 'Sony RX100',
            }
            break
        }
        case SupportedCameras.NikoNZ5:
        case SupportedCameras.NikonD3400:
        case SupportedCameras.NikonD5300:
        case SupportedCameras.NikonD7500: {
            const NIKON_LOOKUP = {
                'NIKON CORPORATION - NIKON D5300': 'Nikon D5300',
                'NIKON CORPORATION - NIKON D3400': 'Nikon D3400',
                'NIKON CORPORATION - NIKON Z 5': 'Nikon Z5',
                'NIKON CORPORATION - NIKON D7500': 'Nikon D7500',
            }

            metadataOverrides = {
                camera: NIKON_LOOKUP[camera],
            }

            break
        }
        case SupportedCameras.iPhone13: {
            metadataOverrides = {
                camera: 'iPhone 13',
                lens: '',
            }
            break
        }
        case SupportedCameras.Unknown: {
            // Unclear how these ended up in lightroom
            metadataOverrides = {
                camera: 'REPLACE',
                iso: 'REPLACE',
                shutterSpeed: 'REPLACE',
                aperture: 'REPLACE',
                focalLength: 'REPLACE',
                dateTaken: 'REPLACE',
            }
            break
        }
        case SupportedCameras.MotoX4: {
            metadataOverrides = {
                lens: '',
            }
            break
        }
        case SupportedCameras.CanonEOSRebel: {
            metadataOverrides = {}
            break
        }
        case SupportedCameras.Pixel3: {
            metadataOverrides = {
                lens: '',
            }
            break
        }
        case SupportedCameras.DJIMini3Pro: {
            metadataOverrides = {
                camera: 'DJI Mini 3 Pro',
            }
            break
        }
    }
    return metadataOverrides
}

export default metadataOverride
