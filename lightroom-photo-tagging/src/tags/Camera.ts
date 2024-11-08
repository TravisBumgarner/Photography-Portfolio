import { Tags } from '../types'

const _FilmPhotography: Tags = {
    general: ['#filmphotography', '#filmisnotdead', '#analogphotography'],
    priority: [
        '#analogsunrise',
        '@analogsunrise',
        '#shootfilmmag',
        '@shootfilmworld',
    ],
}

const _35mmFilmPhotography: Tags = {
    general: ['#35mm', '#thedaily35mm', '#35mmfilm'],
    priority: [],
}

const _120mmFilmPhotography: Tags = {
    general: ['#120', '#120film'],
    priority: [],
}

const _iPhonePhotography: Tags = {
    general: ['#iphonephotography', '#shotoniphone', '#mobilephotography'],
    priority: [],
}

const NikonZ5: Tags = {
    general: ['#nikon', '#nikonz5', '#nikonphotography', '#nikonphotographer'],
    priority: [],
}

const NikonSLR: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._35mmFilmPhotography.general,
        '#nikon',
        '#nikonphotography',
    ],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
}

const NikonD5300: Tags = {
    general: [
        '#nikon',
        '#nikond5300',
        '#nikonphotography',
        '#nikonphotographer',
    ],
    priority: [],
}

const NikonD7500: Tags = {
    general: [
        '#nikon',
        '#nikond7500',
        '#nikonphotography',
        '#nikonphotographer',
    ],
    priority: [],
}

const Pixel3: Tags = {
    general: [
        '#shotonpixel',
        '#pixel3',
        '#googlepixel3',
        '#googlepixel',
        '#pixelartist',
    ],
    priority: [],
}

const iPhone13: Tags = {
    general: [..._iPhonePhotography.general, '#iphone13'],
    priority: [..._iPhonePhotography.priority],
}

const iPhone15: Tags = {
    general: [..._iPhonePhotography.general, '#iphone15'],
    priority: [..._iPhonePhotography.priority],
}

const YashicaC: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._120mmFilmPhotography.general,
        '#yashicac',
        '#yashica',
    ],
    priority: [..._FilmPhotography.priority, ..._120mmFilmPhotography.priority],
}

const PentaxK1000: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._35mmFilmPhotography.general,
        '#pentax',
        '#k1000',
        '#pentaxk1000',
    ],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
}

const DJIMini3Pro: Tags = {
    general: [
        '#dji',
        '#djiphotography',
        '#djidrone',
        '#djicreator',
        '#djimini3pro',
    ],
    priority: [],
}

const OlympusPS: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._35mmFilmPhotography.general,
        '#olympusphotography',
        '#olympuscamera',
    ],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
}

const UnknownFilmCamera: Tags = {
    general: [..._FilmPhotography.general, ..._35mmFilmPhotography.general],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
}

const Camera = {
    DJIMini3Pro,
    iPhone13,
    iPhone15,
    NikonD5300,
    NikonD7500,
    NikonSLR,
    NikonZ5,
    OlympusPS,
    PentaxK1000,
    Pixel3,
    YashicaC,
    UnknownFilmCamera,
}
export default Camera
