import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import Methods from './Components/Methods/Methods'
import Title from './Components/Title/Title'

const App = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <div className='container'> 
        <Title subTitle='Objective: Equip students with the strategies and confidence to tackle problems on their own!' title='Discover Teaching Methods'/>
        <Methods/>
      </div>
    </div>
  )
}

export default App
