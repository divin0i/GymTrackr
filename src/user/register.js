import React, { useState, useEffect } from 'react';
import './register.css';
import { db, auth } from '../firebase/db';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: 'default' });

  useEffect(() => {
    if (formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.password !== '') {
      setMessage({ text: 'Password is valid', type: 'success' });
    } else if (formData.password.length > 0 && formData.password.length < 6) {
      setMessage({ text: 'Password should be at least 6 characters', type: 'error' });
    } else if (formData.password !== formData.confirmPassword && formData.confirmPassword !== '') {
      setMessage({ text: 'Passwords do not match', type: 'error' });
    } else {
      setMessage({ text: '', type: 'default' });
    }
  }, [formData.password, formData.confirmPassword]);

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
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
      });

      setMessage({ text: 'Registration successful!', type: 'success' });
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ text: `Error: ${error.code} - ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className='register-page'>
      <form className='register-form' onSubmit={handleSubmit}>
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
        <p className='message'>
          Already have an account? <a href='/login'>Login</a>
        </p>
        <p className={`message ${message.type}`}>{message.text}</p>
      </form>
      <div className='phone-bar'>
        <h1 className='tab_bar'></h1>
      </div>
    </div>
  );
}

export default Register;
