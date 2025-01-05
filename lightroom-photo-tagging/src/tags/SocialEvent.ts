import { Tags } from '../types'

const DayOfTheDead: Tags = {
    general: [
        '#dayofthedead',
        '#DiaDeMuertos',
        '#DiaDeLosMuertos',
        '#ddlm',
        '#marigolds',
    ],
    priority: [],
    bluesky: [],
}

const MexicoCityFireworksFestival: Tags = {
    general: [
        '#torostultepec',
        '#pirotecniatultepec',
        '#tultepec',
        '#tultepeccapitaldelapirotécnia',
        '#fireworks',
    ],
    priority: [],
    bluesky: [],
}

const PrideCelebration: Tags = {
    general: ['#pride', '#pridemonth', '#equality'],
    priority: [],
    bluesky: [],
}

const SocialEvent = {
    DayOfTheDead,
    MexicoCityFireworksFestival,
    PrideCelebration,
}

export { DayOfTheDead, MexicoCityFireworksFestival }
export default SocialEvent
