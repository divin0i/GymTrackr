import React, { useState } from 'react'
import '../pages/homepage.css'
import { ChevronLeft, User } from 'react-feather'
import logo from '../Assets/logo.png'

function Homepage() {
  // ✅ State to manage checkbox toggles
  const [objectives, setObjectives] = useState({
    weightLoss: true,
    strongCore: false,
  });

  // ✅ Toggle handler
  const handleCheckboxChange = (key) => {
    setObjectives((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className='template-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <div>
            <ChevronLeft className='chevron-icon' />
          </div>
          <div className='user'>
            <a href='/' className='logo-link'>
              <img src={logo} alt='GymTrakr Logo' className='logo' />
            </a>
          </div>
          <div className='User'>
            <User className='user-icon' color='white' />
          </div>
        </div>

        <div className='phone-content'>
          <h2 className='plan-title'>What’s the plan Today, [Name] !</h2>

          <div className='objectives'>
            <h3>OBJECTIVES</h3>
            <ul>
              <li>
                <input
                  type="checkbox"
                  checked={objectives.weightLoss}
                  onChange={() => handleCheckboxChange('weightLoss')}
                />
                {' '}Loose 5KG
              </li>
              <li>
                <input
                  type="checkbox"
                  checked={objectives.strongCore}
                  onChange={() => handleCheckboxChange('strongCore')}
                />
                {' '}Strong core 6 packs
              </li>
            </ul>
          </div>

          <div className='calories-section'>
            <div className='time-remaining'>
              <p>TIME REMAINING:</p>
              <span>02:56:59</span>
            </div>

            <div className='calories-circle'>
              <div className='circle'>Calories</div>
              <div className='calories-info'>
                <p>Calories to burn: <span className='green'>2500 Kcal</span></p>
                <p>Calories to burned: <span className='red'>500 Kcal</span></p>
                <p>Remaining: <span className='blue'>2000 Kcal</span></p>
              </div>
            </div>
          </div>

          <div className='streak-section'>
            <h4>Streak - July</h4>
            <div className='streak-bars'>
              {[...Array(20)].map((_, i) => (
                <div key={i} className='bar'></div>
              ))}
            </div>
          </div>

          <div className='session-buttons'>
            <button className='session-btn'>Current session</button>
            <button className='session-btn'>History</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Homepage
