import React from 'react';
import './workout.css';
import { ChevronLeft } from 'react-feather';
import logo from '../Assets/logo.png';
import Cardio from '../Assets/absd.png';
import Chest from '../Assets/chest.png';
import Abs from '../Assets/abs.png';
import Arms from '../Assets/arms.png';
import { useNavigate } from 'react-router-dom';

function Workout() {
  const navigate = useNavigate();

  const handleSectionClick = (type) => {
    navigate(`/${type.toLowerCase()}-exercise`);
  };

  return (
    <div className='workout-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/' className='logo-link'>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </a>
        </div>
        <div className='workout-content'>
          <h2>Today's Workout</h2>
          <div className='workout-section' onClick={() => handleSectionClick('Cardio')}>
            <img src={Cardio} alt='Cardio' className='section-image' />
            <div className='section-info'>
              <h3>Cardio</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Chest')}>
            <img src={Chest} alt='Chest' className='section-image' />
            <div className='section-info'>
              <h3>Chest</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Abs')}>
            <img src={Abs} alt='Abs' className='section-image' />
            <div className='section-info'>
              <h3>Abs</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Arms')}>
            <img src={Arms} alt='Arms' className='section-image' />
            <div className='section-info'>
              <h3>Arms</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workout;
