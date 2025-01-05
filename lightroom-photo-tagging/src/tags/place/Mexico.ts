import { Tags } from '../../types'

const Baja: Tags = {
    general: ['#lapaz', '#bajacalifornia', '#baja'],
    priority: [],
    bluesky: [],
}

const Country: Tags = {
    general: ['#mexico', '#mexicomagico', '#mexicotravel', '#mexicolindo'],
    priority: ['#fotoexploramx'],
    bluesky: ['#mexico'],
}

const MexicoCity: Tags = {
    general: ['#cdmx', '#mexicocity', '#mexicodf'],
    priority: [],
    bluesky: ['#mexicocity', '#cdmx'],
}

const Mexico = {
    Baja,
    Country,
    MexicoCity,
}

export default Mexico
