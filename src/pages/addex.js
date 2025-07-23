import React, { useState } from 'react';
import { db } from '../firebase/db';
import { collection, addDoc } from 'firebase/firestore';
import './addex.css';
import { ChevronLeft } from 'react-feather';
import logo from '../Assets/logo.png';
import { useNavigate } from 'react-router-dom';

function AddExercise({ onExerciseAdded }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('cardio');
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [minCalories, setMinCalories] = useState(0);
  const [duration, setDuration] = useState(5);
  const [met, setMet] = useState(6.0);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || minCalories < 0) {
      setError('Please enter a valid name and minimum calories.');
      return;
    }

    const newExercise = {
      name,
      type,
      muscleGroup: [muscleGroup],
      minCalories: parseInt(minCalories),
      ...(type === 'cardio' ? { duration: parseInt(duration), met: parseFloat(met) } : {}),
      videoUrl: '', // Default empty video URL
      id: name.toLowerCase().replace(/ /g, '-'),
    };

    try {
      await addDoc(collection(db, 'exercises'), newExercise);
      setName('');
      setMinCalories(0);
      setDuration(5);
      setMet(6.0);
      setMuscleGroup('chest');
      setError('');
      if (onExerciseAdded) onExerciseAdded(newExercise);
      alert('Exercise added successfully!');
      navigate('/workout'); // Redirect after success
    } catch (error) {
      setError('Failed to add exercise: ' + error.message);
    }
  };

  return (
    <div className="add-exercise-container">
      <div className='phone-bar'>
        <ChevronLeft className='chevron-icon' onClick={() => navigate(-1)} />
        <div className='phone-bar'>
          <h1 className='top_bar'></h1>
        </div>
        <a href='/home' className='logo-link'>
          <img src={logo} alt='GymTrakr Logo' className='logo' />
        </a>
      </div>
      <h2>Add Custom Exercise</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-exercise-form">
        <div className="form-group">
          <label htmlFor="exercise-name">Name</label>
          <input
            type="text"
            id="exercise-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-type">Type</label>
          <select
            id="exercise-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="muscle-group">Muscle Group</label>
          <select
            id="muscle-group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          >
            <option value="chest">Chest</option>
            <option value="legs">Legs</option>
            <option value="back">Back</option>
            <option value="arms">Arms</option>
            <option value="core">Core</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="min-calories">Minimum Calories</label>
          <input
            type="number"
            id="min-calories"
            value={minCalories}
            onChange={(e) => setMinCalories(e.target.value)}
            min="0"
            required
          />
        </div>
        {type === 'cardio' && (
          <>
            <div className="form-group">
              <label htmlFor="duration">Duration (sec)</label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="met">MET Value</label>
              <input
                type="number"
                id="met"
                value={met}
                onChange={(e) => setMet(e.target.value)}
                step="0.1"
                min="1"
                required
              />
            </div>
          </>
        )}
        <button type="submit" className="add-button">Add Exercise</button>
        <button type="button" className="cancel-button" onClick={() => navigate('/home')}>Cancel</button>
      </form>
    </div>
  );
}

export default AddExercise;