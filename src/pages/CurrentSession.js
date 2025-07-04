import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'react-feather';
import './CurrentSession.css';

function CurrentSession({ sessions, setSessions, exercises, user, updateSessionInFirestore, calculateCalories, calculateTotalCalories, startSession }) {
  const navigate = useNavigate();
  const [showCurrentSession, setShowCurrentSession] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const addExerciseToSession = () => {
    if (!user || !selectedExercise || !currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const exercise = exercises.find(e => e.id === selectedExercise);
    if (exercise) {
      const updatedSession = {
        ...currentSession,
        exercises: [
          ...currentSession.exercises,
          { id: exercise.id, name: exercise.name, duration: 0, laps: 0, videoUrl: exercise.videoUrl, minCalories: exercise.minCalories || 10 }
        ]
      };
      const updatedSessions = [...sessions];
      updatedSessions[sessions.length - 1] = updatedSession;
      setSessions(updatedSessions);
      setShowDropdown(false);
      setSelectedExercise('');
      updateSessionInFirestore(username, updatedSessions);
    }
  };

  const updateDurationLaps = (index, field, delta) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    updatedSession.exercises[index][field] = Math.max(0, (updatedSession.exercises[index][field] || 0) + delta);
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions);
  };

  const removeExercise = (index) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    updatedSession.exercises.splice(index, 1);
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions);
  };

  return (
    <div className='workout-sessions'>
      <div className='workout-sessions-title' onClick={() => setShowCurrentSession(!showCurrentSession)}>
        <p className='sess-title'>Current Session</p>
      </div>
      <div className={showCurrentSession ? 'expandable-section active' : 'expandable-section'}>
        {currentSession ? (
          <div>
            <h3>Session Date: {new Date(currentSession.date).toLocaleString()}</h3>
            {currentSession.exercises.map((exercise, index) => (
              <div key={index} className='exercise-item'>
                <p>{exercise.name}: {exercise.duration} min, {exercise.laps} laps</p>
                <div className='exercise-controls'>
                  <button onClick={() => updateDurationLaps(index, 'duration', -1)}>-</button>
                  <span> Duration (min) </span>
                  <button onClick={() => updateDurationLaps(index, 'duration', 1)}>+</button>
                  <span> </span>
                  <button onClick={() => updateDurationLaps(index, 'laps', -1)}>-</button>
                  <span> Laps </span>
                  <button onClick={() => updateDurationLaps(index, 'laps', 1)}>+</button>
                </div>
                <div className='bottom-controls'>
                  <div>
                    <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="tutorial-link">Tutorial</a>
                  </div>
                  <div className='trash-btn'>
                    <Trash2 size={18} color="#8b0000" onClick={() => removeExercise(index)} />
                  </div>
                </div>
                <span className='calorie-info'>Calories: {calculateCalories(exercise)} kcal</span>
              </div>
            ))}
            <div className='total-calories'>
              <span>Total Calories: {calculateTotalCalories()} kcal</span>
            </div>
            <div className='session-actions'>
              <button className='add-btn' onClick={() => setShowDropdown(!showDropdown)}>
                <Plus size={18} style={{ translate: '-4px 0px' }} color="#000000" />
                Add Exercise
              </button>
              {showDropdown && (
                <div className='dropdown'>
                  <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                    <option value="">Select Exercise</option>
                    {exercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                    ))}
                  </select>
                  <button onClick={addExerciseToSession}>Add</button>
                </div>
              )}
              <button className='start-btn' onClick={startSession}>Start Session</button>
            </div>
          </div>
        ) : (
          <p>No current session available.</p>
        )}
      </div>
    </div>
  );
}

export default CurrentSession;