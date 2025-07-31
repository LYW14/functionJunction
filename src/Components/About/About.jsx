import React from 'react'
import './About.css'
import Lucy1 from '../../assets/Lucy1.png'

const About = () => {
  return (
    <div className='about'>
      <div className="about-left">
        <img src={Lucy1} alt='Lucy in Zion' className='about-img'/>
        </div>
      <div className="about-right">
        <h3> Meet Your Tutor </h3>
        <h2>Hi, I'm Lucy! </h2>
            <p>I'm a Data Science major currently studying at Boston University. 
                I am particularly interested in data visualization and the ethics surrounding data storytelling. 
                In my free time I like to be outside, whether that's hiking, kayaking, or running. 
                I also dance competitively and socially, my favorite style being either salsa or cumbia.
                I love teaching topics in mathematics/statistics and helping students build confidence in their problem-solving skills.
                My favorite math topic is linear algebra. 
                Though I've lived in a few cities across the eastern US, I'm currently based in Boston!
            </p>
        </div>
    </div>
  )
}

export default About
