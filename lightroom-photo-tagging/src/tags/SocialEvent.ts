import { Tags } from '../types'

const DayOfTheDead: Tags = {
    general: ['#dayofthedead', '#DiaDeMuertos', '#DiaDeLosMuertos', '#ddlm', '#marigolds'],
    priority: [],
    bluesky: ['#diadelosmuertos', '#dayofthedead'],
}

const MexicoCityFireworksFestival: Tags = {
    general: ['#torostultepec', '#pirotecniatultepec', '#tultepec', '#tultepeccapitaldelapirotécnia', '#fireworks'],
    priority: [],
    bluesky: ['#fireworks'],
}

const PrideCelebration: Tags = {
    general: ['#pride', '#pridemonth', '#equality'],
    priority: [],
    bluesky: ['#pride'],
}

const ChineseNewYear: Tags = {
    general: ['#chinesenewyear', '#yearofthesnake'],
    priority: [],
    bluesky: ['#chinesenewyear', '#yearofthesnake'],
}

const SocialEvent = {
    DayOfTheDead,
    MexicoCityFireworksFestival,
    PrideCelebration,
    ChineseNewYear,
}

export { DayOfTheDead, MexicoCityFireworksFestival }
export default SocialEvent
