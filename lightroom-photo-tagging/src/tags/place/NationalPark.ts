import { Tags } from '../../types'

const _USPark: Tags = {
    general: [],
    priority: ['#nationalparkgeek'],
    bluesky: ['#nationalparks'],
}

const _CanadaPark: Tags = {
    general: [],
    priority: [],
    bluesky: ['#nationalparks'],
}

const Arches: Tags = {
    general: [..._USPark.general, '#archesnationalpark'],
    priority: ['#archesnps', '@archesnps', ..._USPark.priority],
    bluesky: [..._USPark.bluesky, '#arches'],
}

const Banff: Tags = {
    general: [
        ..._CanadaPark.general,
        '#banff',
        '#banffnationalpark',
        '#banffcanada',
        '#banffalberta',
    ],
    priority: ['@banff.national.park', ..._CanadaPark.priority],
    bluesky: [..._CanadaPark.bluesky, '#banff'],
}

const Glacier: Tags = {
    general: [..._USPark.general, '#glaciernationalpark'],
    priority: ['#glaciernps', '@glaciernps', ..._USPark.priority],
    bluesky: [..._USPark.bluesky, '#glaciernationalpark'],
}

const NationalPark = {
    Arches,
    Banff,
    Glacier,
}

export default NationalPark
