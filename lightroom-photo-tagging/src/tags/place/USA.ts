import { Tags } from '../../types'

const Arizona: Record<string, Tags> = {
    State: {
        general: ['#arizona', '#az'],
        priority: [],
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
