import React, { useState, useEffect } from 'react';
import './workout.css';
import { ChevronLeft, Plus, Trash2 } from 'react-feather';
import logo from '../Assets/logo.png';
import Cardio from '../Assets/cardio.png';
import Chest from '../Assets/chest.png';
import Abs from '../Assets/abs.png';
import Arms from '../Assets/arms.png';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/db';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import CurrentSession from './CurrentSession';

function Workout() {
  const navigate = useNavigate();
  const [showCurrentSession, setShowCurrentSession] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [], height: 0, weight: 0, age: 0, gender: '' };
        setUserData(userData);
        setSessions(userData.sessions || []);

        const exerciseSnapshot = await getDocs(collection(db, 'exercises'));
        const exerciseList = exerciseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercises(exerciseList);
      }
    };
    fetchData();
  }, [user]);

  const handleSectionClick = (type) => {
    navigate(`/${type.toLowerCase()}-exercise`);
  };

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
          { id: exercise.id, name: exercise.name, reps: exercise.type === 'cardio' ? 0 : 0, duration: exercise.type === 'cardio' ? 0 : undefined, laps: 0, videoUrl: exercise.videoUrl, minCalories: exercise.minCalories || 10, type: exercise.type }
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

  const updateRepsLaps = (index, field, delta) => {
    if (!currentSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const updatedSession = { ...currentSession };
    const exercise = updatedSession.exercises[index];
    if (exercise.type === 'cardio' && field === 'reps') {
      updatedSession.exercises[index].duration = Math.max(0, (exercise.duration || 0) + delta);
    } else {
      updatedSession.exercises[index][field] = Math.max(0, (exercise[field] || 0) + delta);
    }
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

  const updateSessionInFirestore = async (username, updatedSessions) => {
    const userDocRef = doc(db, 'users', username);
    await updateDoc(userDocRef, { sessions: updatedSessions });
  };

  const calculateCalories = (exercise) => {
    if (!exercise || !exercise.minCalories) return 0;
    const minCalories = exercise.minCalories;
    const effort = exercise.type === 'cardio' ? (exercise.duration || 1) * (exercise.laps || 1) : (exercise.reps || 1) * (exercise.laps || 1);
    const targetEffort = exercise.type === 'cardio' ? 60 : 25; // 60 min * 1 lap for cardio, 25 reps * laps for others
    const maxCalories = exercise.type === 'cardio' ? 300 : 52.43; // Adjusted max for cardio
    const increase = maxCalories - minCalories;
    const calories = minCalories + (increase * (Math.max(0, effort - 1) / (targetEffort - 1)));
    return Math.max(minCalories, Math.round(calories));
  };

  const calculateTotalCalories = () => {
    if (!currentSession) return 0;
    return currentSession.exercises.reduce((total, exercise) => total + calculateCalories(exercise), 0);
  };

  const startSession = () => {
    if (currentSession && currentSession.exercises.length > 0) {
      navigate('/session', { state: { session: currentSession } });
    }
  };

  return (
    <div className='workout-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' onClick={() => navigate(-1)} />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/home' className='logo-link'>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </a>
        </div>
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
                    <p>{exercise.name}: {exercise.type === 'cardio' ? `${exercise.duration} min, ${exercise.laps} laps` : `${exercise.reps} reps, ${exercise.laps} laps`}</p>
                    <div className='exercise-controls'>
                      {exercise.type === 'cardio' ? (
                        <>
                          <button onClick={() => updateRepsLaps(index, 'reps', -1)}>-</button>
                          <span> Min </span>
                          <button onClick={() => updateRepsLaps(index, 'reps', 1)}>+</button>
                          <span> </span>
                          <button onClick={() => updateRepsLaps(index, 'laps', -1)}>-</button>
                          <span> Laps </span>
                          <button onClick={() => updateRepsLaps(index, 'laps', 1)}>+</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => updateRepsLaps(index, 'reps', -1)}>-</button>
                          <span> Reps </span>
                          <button onClick={() => updateRepsLaps(index, 'reps', 1)}>+</button>
                          <span> </span>
                          <button onClick={() => updateRepsLaps(index, 'laps', -1)}>-</button>
                          <span> Laps </span>
                          <button onClick={() => updateRepsLaps(index, 'laps', 1)}>+</button>
                        </>
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
                    <Plus size={18} style={{ translate: '-4px 3px' }} color="#000000" />
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
          <div className='workout-sessions-title' onClick={() => setShowHistory(!showHistory)}>
            <p className='sess-title'>History</p>
          </div>
          <div className={showHistory ? 'expandable-section active' : 'expandable-section'}>
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <div key={index}>
                  <h3>Session Date: {new Date(session.date).toLocaleString()}</h3>
                  {session.exercises.map((exercise, exIndex) => (
                    <div key={exIndex}>
                      <p>{exercise.name}: {exercise.type === 'cardio' ? `${exercise.duration} min, ${exercise.laps} laps` : `${exercise.reps} reps, ${exercise.laps} laps`}</p>
                      <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="tutorial-link">Tutorial</a>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No history available.</p>
            )}
          </div>
        </div>
        <div className='workout-content'>
          <h2>Today's Workout</h2>
          <div className='workout-section' onClick={() => handleSectionClick('Cardio')}>
            <img src={Cardio} alt='Cardio' className='section-image' />
            <div className='section-info'>
              <h3>Cardio</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Chest')}>
            <img src={Chest} alt='Chest' className='section-image' />
            <div className='section-info'>
              <h3>Chest</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Abs')}>
            <img src={Abs} alt='Abs' className='section-image' />
            <div className='section-info'>
              <h3>Abs</h3>
            </div>
          </div>
          <div className='workout-section' onClick={() => handleSectionClick('Arms')}>
            <img src={Arms} alt='Arms' className='section-image' />
            <div className='section-info'>
              <h3>Arms</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workout;