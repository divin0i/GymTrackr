import React, { useState, useEffect } from 'react';
import './login.css';
import { ChevronLeft } from 'react-feather';
import logo from '../Assets/logo.png';
import { auth } from '../firebase/db';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState({ text: '', type: 'default' });
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.password.length >= 6) {
      setMessage({ text: 'Password is valid', type: 'success' });
    } else if (formData.password.length > 0) {
      setMessage({ text: 'Password should be at least 6 characters', type: 'error' });
    } else {
      setMessage({ text: '', type: 'default' });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setMessage({ text: 'Password should be at least 6 characters', type: 'error' });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setMessage({ text: `Error: ${error.code} - ${error.message}`, type: 'error' });
    }
  };

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
      <form className='login-form' onSubmit={handleSubmit}>
        <h2>Welcome Back! Glad to see you, again!</h2>
        <div className='form-group'>
          <input
            placeholder='Enter your email'
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            placeholder='Enter password'
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <div className='remember-me'>
            <a href='/forgot-password' className='forgot-password'>Forgot Password?</a>
          </div>
        </div>
        <button type='submit'>Login</button>
        <p className={`message ${message.type}`}>{message.text}</p>
        <p className='message'>Don't have an account? <a href='/register'>Register</a></p>
      </form>
    </div>
  );
}

export default Login;