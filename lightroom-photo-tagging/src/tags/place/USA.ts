import { Tags } from '../../types'

const Arizona: Record<string, Tags> = {
    State: {
        general: ['#arizona', '#az'],
        priority: [],
        bluesky: ['#arizona'],
    },
    ApacheJunction: {
        general: [
            '#myphx',
            '#cactus',
            '#cactuslover',
            '#cactusgram',
            '#apachejunction',
            '#phoenix',
        ],
        priority: [],
        bluesky: [],
    },
}

const Colorado: Record<string, Tags> = {
    State: {
        general: [
            '#colorado',
            '#coloradophotographer',
            '#coloradophotography',
            '#coloradolove',
        ],
        priority: [],
        bluesky: ['#colorado'],
    },
}

const Montana: Record<string, Tags> = {
    State: {
        general: [
            '#montana',
            '#montanacolors',
            '#montanalife',
            '#montanaliving',
            '#montanaphotographer',
        ],
        priority: [],
        bluesky: ['#montana'],
    },
}

const Louisiana: Record<string, Tags> = {
    NOLA: {
        general: [
            '#nolalove',
            '#neworleans',
            '#neworleansphotography',
            '#nola',
            '#nolalife',
        ],
        priority: [],
        bluesky: [],
    },
}

const Utah: Record<string, Tags> = {
    State: {
        general: [
            '#utah',
            '#utahphotographer',
            '#utahphotography',
            '#utahisbeautiful',
            '#utahtravels',
        ],
        priority: [
            '#utahscanyoncountry',
            '@only.in.utah',
            '@visitmoab',
            '#visitmoab',
        ],
        bluesky: ['#utah'],
    },
}

const Vermont: Record<string, Tags> = {
    State: {
        general: [
            '@vermonttourism',
            '#vermont',
            '#newenglandphotography',
            '#thisisvermont',
            '#vermontlife',
            '#vermontshots',
        ],
        priority: [],
        bluesky: [],
    },
}

const USA = {
    Arizona,
    Colorado,
    Louisiana,
    Montana,
    Utah,
    Vermont,
}

export default USA
