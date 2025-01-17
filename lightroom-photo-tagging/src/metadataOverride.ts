import { Metadata, ParsedData, SupportedCameras } from './types'

const metadataOverride = (
    camera: SupportedCameras,
    data: ParsedData,
    tags: string[]
): Partial<Metadata> => {
    let metadataOverrides: Partial<Metadata> = {}

    let cameraLookup = camera
    if (tags.includes('cameracoffeewander|Camera|PentaxK1000')) {
        cameraLookup = SupportedCameras.PentaxK1000
    }

    if (tags.includes('cameracoffeewander|Camera|YashicaC')) {
        cameraLookup = SupportedCameras.YashicaC
    }

    if (tags.includes('cameracoffeewander|Camera|OlympusPS')) {
        cameraLookup = SupportedCameras.OlympusPS
    }

    if (tags.includes('cameracoffeewander|Camera|NikonSLR')) {
        cameraLookup = SupportedCameras.NikonSLR
    }

    switch (cameraLookup) {
        // Film Scanner
        case SupportedCameras.Scanner1:
        case SupportedCameras.Scanner2: {
            throw new Error('This should be a film camera.')
            break
        }
        case SupportedCameras.PentaxK1000: {
            metadataOverrides = {
                camera: 'Pentax K1000',
            }
            break
        }
        case SupportedCameras.YashicaC: {
            metadataOverrides = {
                camera: 'Yashica C',
            }
            break
        }
        case SupportedCameras.OlympusPS: {
            metadataOverrides = {
                camera: 'Olympus Stylus P&S',
            }
            break
        }
        case SupportedCameras.NikonSLR: {
            metadataOverrides = {
                camera: 'Nikon SLR',
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

            const cameraKey = camera as keyof typeof NIKON_LOOKUP
            metadataOverrides = {
                camera: NIKON_LOOKUP[cameraKey],
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
            throw new Error('Unknown camera')
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
