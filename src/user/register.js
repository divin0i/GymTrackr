import React, { useState, useEffect } from 'react';
import './register.css';
import { db, auth } from '../firebase/db';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ChevronLeft } from 'react-feather';
import logo from '../Assets/logo.png';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    height: '',
    weight: '',
    age: '',
    gender: ''
  });
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ text: '', type: 'default' });
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 1) {
      if (formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.password !== '') {
        setMessage({ text: 'Password is valid', type: 'success' });
      } else if (formData.password.length > 0 && formData.password.length < 6) {
        setMessage({ text: 'Password should be at least 6 characters', type: 'error' });
      } else if (formData.password !== formData.confirmPassword && formData.confirmPassword !== '') {
        setMessage({ text: 'Passwords do not match', type: 'error' });
      } else {
        setMessage({ text: '', type: 'default' });
      }
    }
  }, [formData.password, formData.confirmPassword, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (formData.password.length < 6) {
      setMessage({ text: 'Password should be at least 6 characters', type: 'error' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.height || !formData.weight || !formData.age || !formData.gender) {
      setMessage({ text: 'Please fill all fields', type: 'error' });
      return;
    }

    // Check if username already exists
    const usernameDocRef = doc(db, 'users', formData.username);
    const usernameDocSnap = await getDoc(usernameDocRef);
    if (usernameDocSnap.exists()) {
      setMessage({ text: 'Username already taken', type: 'error' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(usernameDocRef, {
        uid: user.uid,
        email: formData.email,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        age: parseInt(formData.age),
        gender: formData.gender,
        createdAt: new Date(),
      });

      setMessage({ text: 'Registration successful!', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Navigate after 2 seconds
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        height: '',
        weight: '',
        age: '',
        gender: ''
      });
      setStep(1);
    } catch (error) {
      setMessage({ text: `Error: ${error.code} - ${error.message}`, type: 'error' });
    }
  };

  return (
    <div className='register-container'>
      <div className='register-page'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' onClick={() => step === 2 && setStep(1)} />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/' className='logo-link'>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </a>
        </div>
        <div className='phone-content'>
          <div className={`form-wrapper ${step === 2 ? 'slide-right' : ''}`}>
            {step === 1 && (
              <form className='register-form' onSubmit={handleNext}>
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
                <button type='submit'>Next</button>
                <p className='message'>
                  Already have an account? <a href='/login'>Login</a>
                </p>
                <p className={`message ${message.type}`}>{message.text}</p>
              </form>
            )}
            {step === 2 && (
              <form className='register-form' onSubmit={handleSubmit}>
                <h2>Enter Your Details</h2>
                <div className='form-group'>
                  <input
                    type='number'
                    id='height'
                    name='height'
                    placeholder='Height (cm)'
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <input
                    type='number'
                    id='weight'
                    name='weight'
                    placeholder='Weight (kg)'
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <input
                    type='number'
                    id='age'
                    name='age'
                    placeholder='Age'
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='form-group'>
                  <select
                    id='gender'
                    name='gender'
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button type='submit'>Register</button>
                  <button type='button' className='back-btn' style={{ marginTop: '10px' }} onClick={() => setStep(1)}>Back</button>

                <p className={`message ${message.type}`}>{message.text}</p>
              </form>
            )}
          </div>
        </div>
        <div className='phone-bar'>
          <h1 className='bottom_bar' style={{ marginTop: '160px' }}></h1>
        </div>
      </div>
    </div>
  );
}

export default Register;
