import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle, Plus, Trash2 } from 'react-feather';
import './CurrentSession.css';

function CurrentSession({ sessions, setSessions, exercises, user, updateSessionInFirestore, calculateCalories, calculateTotalCalories, startSession, showCurrentSession, setShowCurrentSession }) {
  const navigate = useNavigate();
  const [localShowCurrentSession, setLocalShowCurrentSession] = useState(showCurrentSession || false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  useEffect(() => {
    if (typeof setShowCurrentSession !== 'function') {
      console.error('setShowCurrentSession is not a function, using local state:', setShowCurrentSession);
    } else {
      setLocalShowCurrentSession(showCurrentSession);
    }
  }, [showCurrentSession, setShowCurrentSession]);

  const addExerciseToSession = () => {
    if (!user || !selectedExercise) return;
    const username = user.displayName || user.email.split('@')[0];
    const exercise = exercises.find(e => e.id === selectedExercise);
    if (!exercise) {
      console.error('Selected exercise not found:', selectedExercise);
      return;
    }

    // Create or update current session
    let updatedSessions = [...sessions];
    if (!currentSession) {
      const newSession = {
        date: new Date().toISOString(),
        name: `Session - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        exercises: []
      };
      updatedSessions = [...sessions, newSession];
    }

    const targetSession = updatedSessions[updatedSessions.length - 1];
    const newExercise = {
      id: exercise.id,
      name: exercise.name || 'Unnamed Exercise',
      reps: exercise.type === 'cardio' ? 0 : 0,
      laps: 0,
      weight: exercise.type === 'cardio' ? 0 : (selectedWeight || 0),
      duration: exercise.type === 'cardio' ? (selectedDuration || 0) : 0,
      videoUrl: exercise.videoUrl || '',
      minCalories: exercise.minCalories || 10,
      type: exercise.type || 'strength', // Default to strength if undefined
      met: exercise.met || (exercise.type === 'cardio' ? 3 : undefined),
      sets: exercise.sets || 1
    };

    const updatedSession = {
      ...targetSession,
      exercises: [...targetSession.exercises, newExercise]
    };
    updatedSessions[updatedSessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    setShowDropdown(false);
    setSelectedExercise('');
    setSelectedWeight(0);
    setSelectedDuration(0);
    updateSessionInFirestore(username, updatedSessions).catch(error => {
      console.error('Failed to update session:', error);
      setSessions(sessions); // Revert on failure
    });
  };

  const updateRepsLaps = (index, field, delta) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    const exercise = updatedSession.exercises[index];
    if (exercise.type !== 'cardio' && field === 'weight') {
      updatedSession.exercises[index].weight = Math.max(0, (exercise.weight || 0) + delta);
    } else {
      updatedSession.exercises[index][field] = Math.max(0, (exercise[field] || 0) + delta);
    }
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions).catch(error => {
      console.error('Failed to update reps/laps:', error);
      setSessions(sessions); // Revert on failure
    });
  };

  const updateDuration = (index, value) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    updatedSession.exercises[index].duration = Math.max(0, parseInt(value) || 0);
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions).catch(error => {
      console.error('Failed to update duration:', error);
      setSessions(sessions); // Revert on failure
    });
  };

  const updateWeight = (index, value) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    updatedSession.exercises[index].weight = Math.max(0, parseInt(value) || 0);
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions).catch(error => {
      console.error('Failed to update weight:', error);
      setSessions(sessions); // Revert on failure
    });
  };

  const removeExercise = (index) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    updatedSession.exercises.splice(index, 1);
    const updatedSessions = [...sessions];
    updatedSessions[sessions.length - 1] = updatedSession;
    setSessions(updatedSessions);
    updateSessionInFirestore(username, updatedSessions).catch(error => {
      console.error('Failed to remove exercise:', error);
      setSessions(sessions); // Revert on failure
    });
  };

  const canStartSession = () => {
    return currentSession && currentSession.exercises.every(exercise => 
      (exercise.type === 'cardio' ? exercise.duration > 0 : exercise.reps > 0 && exercise.weight > 0) && exercise.laps >= 1
    );
  };

  return (
    <div className='workout-sessions'>
      <div className='workout-sessions-title' onClick={() => setLocalShowCurrentSession(!localShowCurrentSession)}>
        <p className='sess-title'>Current Session</p>
      </div>
      <div className={localShowCurrentSession ? 'expandable-section active' : 'expandable-section'}>
        {currentSession ? (
          <div>
            <h3>Session Name: {currentSession.name}</h3>
            {currentSession.exercises.map((exercise, index) => (
              <div key={index} className='exercise-item'>
                <p>{exercise.name}: {exercise.type === 'cardio' ? `${exercise.duration} sec, ${exercise.laps} laps` : `${exercise.reps} reps, ${exercise.laps} laps, ${exercise.weight} kg`}</p>
                <div className='exercise-controls'>
                  {exercise.type === 'cardio' ? (
                    <div className='counter-row'>
                      <div>
                        <span>Duration: </span>
                        <input
                          type="number"
                          value={exercise.duration || 0}
                          onChange={(e) => updateDuration(index, e.target.value)}
                          min="0"
                          className="duration-input"
                        />
                        <span> sec</span>
                      </div>
                      <div>
                        <button onClick={() => updateRepsLaps(index, 'laps', -1)}><MinusCircle size={15} /></button>
                        <span>Laps</span>
                        <button onClick={() => updateRepsLaps(index, 'laps', 1)}><PlusCircle size={15} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className='counter-row'>
                      <div>
                        <button onClick={() => updateRepsLaps(index, 'reps', -1)}><MinusCircle size={15} /></button>
                        <span>Reps</span>
                        <button onClick={() => updateRepsLaps(index, 'reps', 1)}><PlusCircle size={15} /></button>
                      </div>
                      <div>
                        <button onClick={() => updateRepsLaps(index, 'laps', -1)}><MinusCircle size={15} /></button>
                        <span>Laps</span>
                        <button onClick={() => updateRepsLaps(index, 'laps', 1)}><PlusCircle size={15} /></button>
                      </div>
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={exercise.weight || 0}
                          onChange={(e) => updateWeight(index, e.target.value)}
                          className="weight-slider"
                        />
                        <span> Weight: {exercise.weight} kg </span>
                      </div>
                    </div>
                  )}
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
                  <input
                    type="number"
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value) || 0)}
                    placeholder="Duration (sec)"
                    min="0"
                    className="duration-input"
                  />
                  <input
                    type="number"
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(parseInt(e.target.value) || 0)}
                    placeholder="Weight (kg)"
                    min="0"
                    className="weight-input"
                  />
                  <button onClick={addExerciseToSession}>Add</button>
                </div>
              )}
              <button className='start-btn' onClick={() => canStartSession() ? startSession() : alert('Cannot start session: Ensure all exercises have non-zero reps, duration, or weight (laps must be at least 1).')} disabled={!canStartSession()}>
                Start Session
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>No active session available.</p>
            <button className='go-to-workout-btn' onClick={() => navigate('/workout')}>Go to Workout</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentSession;