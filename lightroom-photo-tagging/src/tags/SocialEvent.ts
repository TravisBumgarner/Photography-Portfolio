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
}

const PrideCelebration: Tags = {
    general: ['#pride', '#pridemonth', '#equality'],
    priority: [],
}

const SocialEvent = {
    DayOfTheDead,
    MexicoCityFireworksFestival,
    PrideCelebration,
}

export { DayOfTheDead, MexicoCityFireworksFestival }
export default SocialEvent
