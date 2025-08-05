import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import Methods from './Components/Methods/Methods'
import Title from './Components/Title/Title'
import About from './Components/About/About'
import OnDemand from './Components/OnDemand/OnDemand'
import Testimonials from './Components/Testimonials/Testimonials'
import Contact from './Components/Contact/Contact'
import Footer from './Components/Footer/Footer'

const App = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <div className='container'> 
        <Title subTitle='Objective: Equip students with the strategies and confidence to tackle problems on their own!' title='Discover Teaching Methods'/>
        <Methods/>
        <About/>
        <Title subTitle='Can&apos;t make it to a session? Check out my YouTube channel! Access helpful, digestible tutoring videos anytime!' title='On Demand Learning'/>
        {/* <OnDemand/> */}
        <Title subTitle='Hear from real students!' title='Testimonials'/>
        <Testimonials/>
        <Title subTitle='Have questions? Want to learn more? Reach out!' title='Contact Us'/>
        <Contact/>
        <Footer/>
      </div>
    </div>
  )
}

export default App
