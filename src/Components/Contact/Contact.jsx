import React from 'react'
import './Contact.css'
import linkedin_icon from '../../assets/linkedin.svg'
import email_icon from '../../assets/email.svg' 
import location_icon from '../../assets/location-icon.png'

const Contact = () => {
    const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "5539fded-e838-4d4c-a672-018527035f94");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };
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
            <li><a href="https://www.linkedin.com/in/lyw14/"><img src={linkedin_icon} alt=''></img>
                LinkedIn: Lucy Wang</a></li>
            <li><img src={location_icon} alt=''></img>
                Boston, MA 02113, United States</li>
        </ul>
      </div>
      <div className="contact-col">
        <form onSubmit={onSubmit}>
          <input type="text" name="name" placeholder='Your Name' required />
          <input type="email" name="email" placeholder='Your Email' required />
          <textarea name="message" rows="5" placeholder='Your Message' required></textarea>
          <button type='submit' className='btn dark-btn'>Send Message</button>
        </form>
        <span></span>
      </div>
    </div>
  )
}

export default Contact
