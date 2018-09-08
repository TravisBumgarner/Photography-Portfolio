import React, { Component } from 'react'

import { Text } from 'Components'

import { AboutWrapper, TextWrapper } from './About.styles'

class About extends Component {
    render() {
        return (
            <AboutWrapper>
                <TextWrapper>
                    <Text size="medium">
                        Photography has always been an interest of mine. I got
                        my first film camera when I was about 10 years old and
                        began to explore the world around me. Sometime after
                        that, I moved on to digital photography and in 2011,
                        while backpacking in South East Asia, I purchased a DSLR
                        camera after getting to play around with my friend’s.
                        However, I never took it off auto and reverted to my
                        point & shoot once I got home from my trip.
                    </Text>

                    <Text size="medium">
                        The next year, I was accepted to the Peace Corps and
                        decided to take only my point & shoot with me. Peace
                        Corps was a time of learning new hobbies due to the
                        abundant amount of down time I had and so after a few
                        months, when my family came to visit for Christmas, I
                        had them bring my DSLR down. Several months went by
                        during which time it remained on my shelf.
                    </Text>

                    <Text size="medium">
                        It wasn’t until one fateful day, during Carnival in
                        2014, while walking through the streets of Chitre,
                        Panama, a girl slipped her hand into my side pocket,
                        lifted my point & shoot, and disappeared into the crowd.
                        With no choice but to use my DLSR, I decided it was
                        finally time I learned a bit more about photography. I
                        dived straight into the deep end of the photography
                        world – reading, watching, and taking in everything I
                        could get my hands on.
                    </Text>

                    <Text size="medium">
                        That was almost two years ago and I continue to enjoy
                        photography and take photos whenever I get a chance.
                    </Text>
                </TextWrapper>
            </AboutWrapper>
        )
    }
}

export default About
