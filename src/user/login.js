import React from 'react'
import './login.css'
import { ChevronLeft } from 'react-feather'
import logo from '../Assets/logo.png' // Adjust the path as necessary

function Login() {
  return (
    <div className='login-container'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/' className='logo-link'>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </a>
        </div>
        <form className='login-form'>
            <h2>Welcome Back ! Glad to see you, again !</h2>
            <div className='form-group'>
            <input placeholder='Enter your email' type='email' id='email' name='email' required />
            </div>
            <div className='form-group'>
            <input placeholder='Enter password' type='password' id='password' name='password' required />
            </div>
            <div className='form-group'>
                <div className='remember-me'>
                    <a href='/forgot-password' className='forgot-password'>Forgot Password?</a>
                </div>
            </div>
            <button type='submit'>Login</button>
            <p className='message'>Don't have an account? <a href='/register'>Register</a></p>
        </form>
    </div>
  )
}

export default Login