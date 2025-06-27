import React from 'react'
// import './phone-frame.css'
import { ChevronLeft } from 'react-feather'
import logo from './Assets/logo.png' // Adjust the path as necessary

function Frame() {
  return (
    <div>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <img src={logo} alt='GymTrakr Logo' className='logo' />
        </div>
    </div>
  )
}

export default Frame