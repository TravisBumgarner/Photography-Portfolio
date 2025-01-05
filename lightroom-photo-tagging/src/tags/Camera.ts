import { Tags } from '../types'

const _FilmPhotography: Tags = {
    general: ['#filmphotography', '#filmisnotdead', '#analogphotography'],
    priority: [
        '#analogsunrise',
        '@analogsunrise',
        '#shootfilmmag',
        '@shootfilmworld',
    ],
    bluesky: [],
}

const _35mmFilmPhotography: Tags = {
    general: ['#35mm', '#thedaily35mm', '#35mmfilm'],
    priority: [],
    bluesky: [],
}

const _120mmFilmPhotography: Tags = {
    general: ['#120', '#120film'],
    priority: [],
    bluesky: [],
}

const _iPhonePhotography: Tags = {
    general: ['#iphonephotography', '#shotoniphone', '#mobilephotography'],
    priority: [],
    bluesky: [],
}

const NikonZ5: Tags = {
    general: ['#nikon', '#nikonz5', '#nikonphotography', '#nikonphotographer'],
    priority: [],
    bluesky: [],
}

const NikonSLR: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._35mmFilmPhotography.general,
        '#nikon',
        '#nikonphotography',
    ],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
    bluesky: [],
}

const NikonD5300: Tags = {
    general: [
        '#nikon',
        '#nikond5300',
        '#nikonphotography',
        '#nikonphotographer',
    ],
    priority: [],
    bluesky: [],
}

const NikonD7500: Tags = {
    general: [
        '#nikon',
        '#nikond7500',
        '#nikonphotography',
        '#nikonphotographer',
    ],
    priority: [],
    bluesky: [],
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
    bluesky: [],
}

const iPhone13: Tags = {
    general: [..._iPhonePhotography.general, '#iphone13'],
    priority: [..._iPhonePhotography.priority],
    bluesky: [..._iPhonePhotography.bluesky],
}

const iPhone15: Tags = {
    general: [..._iPhonePhotography.general, '#iphone15'],
    priority: [..._iPhonePhotography.priority],
    bluesky: [..._iPhonePhotography.bluesky],
}

const YashicaC: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._120mmFilmPhotography.general,
        '#yashicac',
        '#yashica',
    ],
    priority: [..._FilmPhotography.priority, ..._120mmFilmPhotography.priority],
    bluesky: [..._FilmPhotography.bluesky, ..._120mmFilmPhotography.bluesky],
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
    bluesky: [..._FilmPhotography.bluesky, ..._35mmFilmPhotography.bluesky],
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
    bluesky: [..._FilmPhotography.bluesky, ..._35mmFilmPhotography.bluesky],
}

const OlympusPS: Tags = {
    general: [
        ..._FilmPhotography.general,
        ..._35mmFilmPhotography.general,
        '#olympusphotography',
        '#olympuscamera',
    ],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
    bluesky: [..._FilmPhotography.bluesky, ..._35mmFilmPhotography.bluesky],
}

const UnknownFilmCamera: Tags = {
    general: [..._FilmPhotography.general, ..._35mmFilmPhotography.general],
    priority: [..._FilmPhotography.priority, ..._35mmFilmPhotography.priority],
    bluesky: [..._FilmPhotography.bluesky, ..._35mmFilmPhotography.bluesky],
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
