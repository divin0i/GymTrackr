import React from 'react'
// import './template.css'
import { ChevronLeft } from 'react-feather'
import logo from '../Assets/logo.png'


function Template() {
  return (
    <div className='template-page'>
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
                <div className='phone-content'>
                    {/* Page content here */}
                </div>
        </div>
    </div>
  )
}

export default Template
