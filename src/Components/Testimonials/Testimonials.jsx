import React, { useRef } from 'react'
import './Testimonials.css'
import next_icon from '../../assets/next-icon.png'
import back_icon from '../../assets/back-icon.png'
import user_1 from '../../assets/user1.svg'

const Testimonials = () => {
    const slider = useRef();
    let tx = 0;
const slideForward = () => {
    if(tx > -50){
        tx -= 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
}
const slideBackward = () => {
    if(tx < 0){
        tx += 25;
    }
    slider.current.style.transform = `translateX(${tx}%)`;
}

  return (
    <div className='testimonial'>
        <img src={next_icon} alt="next arrow" className='next-btn' onClick={slideForward}/>
        <img src={back_icon} alt="back arrow" className='back-btn' onClick={slideBackward}/>
        <div className='slider'>
            <ul ref={slider}>
                <li>
                    <div className='slide'>
                        <div className="user-info">
                            <img src={user_1} alt="user" className='user-img'/>
                            <div className='user-details'>
                                <h4>John Doe 1</h4>
                                <p>Student</p>
                            </div>
                        </div>
                        <p>lorem ipsum</p>
                    </div>
                </li>
                <li>
                    <div className='slide'>
                        <div className="user-info">
                            <img src={user_1} alt="user" className='user-img'/>
                            <div className='user-details'>
                                <h4>Jane Smith 2</h4>
                                <p>Student</p>
                            </div>
                        </div>
                        <p>lorem ipsum</p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
  )
}

export default Testimonials
