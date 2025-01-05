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
    bluesky: ['#diadelosmuertos', '#dayofthedead'],
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
    bluesky: ['#fireworks'],
}

const PrideCelebration: Tags = {
    general: ['#pride', '#pridemonth', '#equality'],
    priority: [],
    bluesky: ['#pride'],
}

const SocialEvent = {
    DayOfTheDead,
    MexicoCityFireworksFestival,
    PrideCelebration,
}

export { DayOfTheDead, MexicoCityFireworksFestival }
export default SocialEvent
