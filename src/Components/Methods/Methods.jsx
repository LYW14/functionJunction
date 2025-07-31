import React, { useState } from 'react'
import './Methods.css'
import nySubway from '../../assets/nySubway.png'
import right_arrow from '../../assets/right-arrow.svg'

const Methods = () => {
  const methods = [
    'Pens-down Policy',
    'Socratic Questioning',
    'Student-set Agenda'
  ];

  const [currentMethod, setCurrentMethod] = useState(0);

  const handleNext = () => {
    setCurrentMethod((prev) => (prev + 1) % methods.length);
  };

  return (
    <div className='methods'>
        {/* <h1 className='methods_title'>Discover Teaching Methods</h1>
        <p className='methods_description'>
            Objective: Equip students with the strategies and confidence to tackle problems on their own!
        </p> */}
        <div className='method'>
            <img src={nySubway} alt='New York Subway'/>
            <div className='caption'>
                <p>{methods[currentMethod]}</p>
            </div>
            <button className='right' onClick={handleNext}>
                <img src={right_arrow} alt="Next Method"/>
            </button>
        </div>
    </div>
  );
};

export default Methods;
