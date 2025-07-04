import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './session.css';
import { ChevronLeft } from 'react-feather';
import { db, auth } from '../firebase/db';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = location.state || { session: { exercises: [] } };
  const [checkedExercises, setCheckedExercises] = useState({});
  const user = auth.currentUser;

  useEffect(() => {
    const initialChecked = {};
    session.exercises.forEach((exercise, index) => {
      initialChecked[index] = false;
    });
    setCheckedExercises(initialChecked);
  }, [session]);

  const toggleCheck = (index) => {
    setCheckedExercises(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const endSession = async () => {
    if (user && session.exercises.length > 0) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [], history: [] };
      const totalCalories = session.exercises.reduce((total, exercise) => total + calculateCalories(exercise), 0);
      const newHistoryEntry = {
        date: new Date().toISOString(),
        exercises: session.exercises.map(exercise => ({
          ...exercise,
          isCompleted: checkedExercises[session.exercises.indexOf(exercise)] || false
        })),
        totalCalories: totalCalories
      };
      const updatedHistory = [...(userData.history || []), newHistoryEntry];
      const updatedSessions = userData.sessions.filter(s => s !== session);
      await updateDoc(userDocRef, { sessions: updatedSessions, history: updatedHistory });
    }
    navigate('/workout');
  };

  const calculateCalories = (exercise) => {
    if (!exercise || !exercise.minCalories) return 0;
    const minCalories = exercise.minCalories;
    const reps = exercise.reps || 1;
    const laps = exercise.laps || 1;
    const effort = reps * laps;
    const targetEffort = 25;
    const maxCalories = 52.43;
    const increase = maxCalories - minCalories;
    const calories = minCalories + (increase * (Math.max(0, effort - 1) / (targetEffort - 1)));
    return Math.max(minCalories, Math.round(calories));
  };

  const calculateTotalCheckedCalories = () => {
    return session.exercises.reduce((total, exercise, index) => {
      return checkedExercises[index] ? total + calculateCalories(exercise) : total;
    }, 0);
  };

  return (
    <div className='session-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' onClick={endSession} />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
        </div>
        <div className='session-content'>
          <h2>Active Session</h2>
          {session.exercises.map((exercise, index) => (
            <div
              key={index}
              className={`checklist-item ${checkedExercises[index] ? 'checked' : ''}`}
              onClick={() => toggleCheck(index)}
            >
              <input
                type="checkbox"
                checked={checkedExercises[index] || false}
                onChange={() => toggleCheck(index)}
                className='checkbox'
              />
              <p>{exercise.name}: {exercise.reps} reps, {exercise.laps} laps</p>
              <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="tutorial-link">
                Tutorial
              </a>
            </div>
          ))}
        </div>
        <div className='phone-bottom-bar'>
          <button className='end-btn' onClick={endSession}>End</button>
          <div className='total-checked-calories'>
            <span>Total Calories Checked: {calculateTotalCheckedCalories()} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;