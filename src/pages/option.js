import React from 'react'
import './option.css'
import { ChevronLeft } from 'react-feather'
import logo from '../Assets/logo.png'


function Option() {
  return (
    <div className='option-page'>
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
                    <div className='option-content'>
                        <div className='option-image'>
                            <img src={logo} alt='GymTrakr Logo' className='option-logo' />
                        </div>
                        <h1 className='option-title'>Train smarter</h1>
                        <div className='option-buttons'>
                            <a href='/register' className='option-button'>Register</a>
                            <a href='/login' className='option-button'>Login</a>
                        </div>
                    </div>
                </div>
                    <div className='phone-bar'>
                        <h1 className='bottom_bar'></h1>
                    </div>
        </div>
    </div>
  )
}

export default Option
