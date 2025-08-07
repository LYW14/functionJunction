import React, { useState } from 'react';
import './Methods.css';
import nySubway from '../../assets/nySubway.png';
import right_arrow from '../../assets/right-arrow.svg';

const Methods = () => {
  const methods = [
    'Pens-down Policy',
    'Scaffolding',
    'Student-set Agenda',
    'Questioning',
    'Active Listening',
    'Positivity'
  ];

  const descriptions = [
    'Pens-down Policy: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating all successes (even the ones that may seem small!) to build confidence and enthusiasm for learning.',
    'Scaffolding: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating all successes to build confidence and enthusiasm for learning.',
    'Student-set Agenda: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating small wins to build confidence and enthusiasm for learning.',
    'Questioning: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating all successes to build confidence and enthusiasm for learning.',
    'Active Listening: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating small wins to build confidence and enthusiasm for learning.',
    'Positivity: Positivity in tutoring helps maintain an encouraging and engaging attitude around the tutoring topic. This also includes positive reinforcement and celebrating all successes to build confidence and enthusiasm for learning.'
  ];

  const [currentMethod, setCurrentMethod] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const handleNext = () => {
    setCurrentMethod((prev) => (prev + 1) % methods.length);
    setShowDescription(false); // Reset description display
  };

  const handleCaptionClick = () => {
    setShowDescription((prev) => !prev); // Toggle show/hide
  };

  return (
    <div className='methods'>
      <div className='method'>
      <div className={`method-content ${showDescription ? 'float-up' : ''}`}>
        <img src={nySubway} alt='New York Subway' />

        <div className="caption" onClick={handleCaptionClick}>
            <p>{methods[currentMethod]}</p>
          </div>
          <button className='right' onClick={handleNext}>
            <img src={right_arrow} alt="Next Method" />
          </button>
        </div>

        {showDescription && (
          <div className="method-description">
            <p>{descriptions[currentMethod]}</p>
          </div>
        )}

        {/* <button className='right' onClick={handleNext}>
          <img src={right_arrow} alt="Next Method" />
        </button> */}
      </div>
    </div>
  );
};

export default Methods;