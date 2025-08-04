import React from 'react'
import './Contact.css'
import linkedin_icon from '../../assets/linkedin.svg'
import email_icon from '../../assets/email.svg' 
import location_icon from '../../assets/location-icon.png'

const Contact = () => {
  return (
    <div className='contact'>
      <div className="contact-col">
        <h3>Send me a message!</h3>
        <p>Feel free to contact me through this contact form. 
            You can leave feedback, questions, comments, or 
            requests for particular problems or topics for a video!
            I will get back to you as soon as I can.
        </p>
        <ul>
            <li> <img src={email_icon} alt=''></img>
                lyw14@bu.edu</li>
            <li><img src={linkedin_icon} alt=''></img>
                LinkedIn: <a href="https://www.linkedin.com/in/lyw14/">Lucy Wang</a></li>
            <li><img src={location_icon} alt=''></img>
                Boston, MA 02113, United States</li>
        </ul>
      </div>
      <div className="contact-col"></div>
    </div>
  )
}

export default Contact
