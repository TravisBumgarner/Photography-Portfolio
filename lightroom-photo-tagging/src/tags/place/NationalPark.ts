import { Tags } from '../../types'

const _USPark: Tags = {
    general: [],
    priority: ['#nationalparkgeek'],
}

const _CanadaPark: Tags = {
    general: [],
    priority: [],
}

const Arches: Tags = {
    general: [..._USPark.general, '#archesnationalpark'],
    priority: ['#archesnps', '@archesnps', ..._USPark.priority],
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
}

const Glacier: Tags = {
    general: [..._USPark.general, '#glaciernationalpark'],
    priority: ['#glaciernps', '@glaciernps', ..._USPark.priority],
}

const NationalPark = {
    Arches,
    Banff,
    Glacier,
}

export default NationalPark
