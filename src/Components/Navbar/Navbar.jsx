import React, { useEffect, useState } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.svg';
import { Link } from 'react-scroll';

const Navbar = () => {
  const [sticky, setSticky] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setNavOpen(prev => !prev);
  };

  return (
    <nav className={`container ${sticky ? 'dark-nav' : ''}`}>
      <img src={logo} alt="logo" className="logo" />

      {/* Menu Icon */}
      <div
        className={`menu-icon ${navOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      ></div>

      {/* Nav Links */}
      <ul className={navOpen ? 'side-nav open' : 'side-nav'}>
        <li><Link to="hero" smooth={true} offset={0} duration={500} onClick={() => setNavOpen(false)}>Home</Link></li>
        <li><Link to="methods" smooth={true} offset={-300} duration={500} onClick={() => setNavOpen(false)}>Methods</Link></li>
        <li><Link to="about" smooth={true} offset={-170} duration={500} onClick={() => setNavOpen(false)}>About</Link></li>
        <li><Link to="onDemand" smooth={true} offset={-300} duration={500} onClick={() => setNavOpen(false)}>On Demand Learning</Link></li>
        {/* <li>On Demand Learning</li> */}
        <li><Link to="testimonial" smooth={true} offset={-300} duration={500} onClick={() => setNavOpen(false)}>Testimonials</Link></li>
        <li>Other Resources</li>
        <li><Link to="contact" smooth={true} offset={-300} duration={500} className="btn" onClick={() => setNavOpen(false)}>Contact Us</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
