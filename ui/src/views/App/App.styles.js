import styled from 'styled-components'

const AppWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    /* align-items: center; */
    justify-content: center;

    &:after {
        content: '';
        background-image: url(${props => props.src});
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-attachment: fixed;
        opacity: 0.3;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        position: absolute;
        z-index: -1;
    }
`

export { AppWrapper }
