import React, { useState } from 'react';
import './register.css';
import { db } from '../firebase/db';
import { collection, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { ChevronLeft, ChevronRight } from 'react-feather';
import logo from '../Assets/logo.png'; // Adjust the path as necessary

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }

    try {
      // Store user data in Firestore in the 'users'
        const userRef = collection(db, 'users');
        await addDoc(userRef, {
        username: formData.username,
        email: formData.email,
        password: await bcrypt.hash(formData.password, 10)
        });

      setMessage('Registration successful!');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Firestore Error:', error.code, error.message);
      setMessage(`Error: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className='register-page'>
      <form className='register-form' onSubmit={handleSubmit}>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/' className='logo-link'>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </a>
        </div>

        <h2>Hello! Register to get started</h2>
        <div className='form-group'>
          <input
            type='text'
            id='username'
            name='username'
            placeholder='Username'
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            id='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            id='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            id='confirm-password'
            name='confirmPassword'
            placeholder='Confirm Password'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type='submit'>Register</button>
        {message && <p className='message'>{message}</p>}
        <p className='message'>
          Already have an account? <a href='/login'>Login</a>
        </p>
      </form>
      <div className='phone-bar'>
        <h1 className='tab_bar'></h1>
      </div>
    </div>
  );
}

export default Register;