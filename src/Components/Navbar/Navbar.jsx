import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.svg'

const Navbar = () => {
  return (
    <nav className='container'>
      <img src={logo} alt="" className='logo'/>
      <ul>
        <li>Home</li>
        <li>Methods</li>
        <li>About</li>
        <li>On Demand Learning</li>
        <li>Other Resources</li>
        <li><button className='btn'>Contact Us</button></li>

      </ul>
    </nav>
  )
}
export default Navbar
