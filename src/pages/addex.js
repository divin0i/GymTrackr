import React, { useState } from 'react';
import { db } from '../firebase/db';
import { collection, addDoc } from 'firebase/firestore';
import './addex.css';

function AddExercise({ onExerciseAdded }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('cardio');
  const [muscleGroup, setMuscleGroup] = useState('chest'); // Default to chest
  const [minCalories, setMinCalories] = useState(0);
  const [duration, setDuration] = useState(5); // Default 5 minutes for cardio
  const [met, setMet] = useState(6.0); // Default MET for cardio
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
      muscleGroup: [muscleGroup], // Store as an array to match existing JSON structure
      minCalories: parseInt(minCalories),
      ...(type === 'cardio' ? { duration: parseInt(duration), met: parseFloat(met) } : {}),
      id: name.toLowerCase().replace(/ /g, '-'), // Generate ID from name
    };

    try {
      await addDoc(collection(db, 'exercises'), newExercise);
      setName('');
      setMinCalories(0);
      setDuration(5);
      setMet(6.0);
      setMuscleGroup('chest');
      setError('');
      if (onExerciseAdded) onExerciseAdded(newExercise); // Callback to refresh Home
      alert('Exercise added successfully!');
    } catch (error) {
      setError('Failed to add exercise: ' + error.message);
    }
  };

  return (
    <div className="add-exercise-container">
      <h2>Add Custom Exercise</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="add-exercise-form">
        <div className="form-group">
          <label htmlFor="exercise-name">Name:</label>
          <input
            type="text"
            id="exercise-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="exercise-type">Type:</label>
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
          <label htmlFor="muscle-group">Muscle Group:</label>
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
          <label htmlFor="min-calories">Minimum Calories:</label>
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
              <label htmlFor="duration">Duration (minutes):</label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="met">MET Value:</label>
              <input
                type="number"
                id="met"
                value={met}
                onChange={(e) => setMet(e.target.value)}
                step="0.1"
                min="1"
              />
            </div>
          </>
        )}
        <button type="submit" className="add-button">Add Exercise</button>
      </form>
    </div>
  );
}

export default AddExercise;
