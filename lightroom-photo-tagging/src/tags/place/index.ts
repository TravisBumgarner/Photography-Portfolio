import Mexico from './Mexico'
import NationalPark from './NationalPark'
import OtherCountries from './OtherCountries'
import USA from './USA'

const Place = {
    Mexico,
    USA,
    NationalPark,
    ...OtherCountries,
}

export default Place
