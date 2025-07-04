import React, { useState, useEffect } from 'react';
import './workout.css';
import { ChevronLeft, Plus, Trash2, X } from 'react-feather';
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
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
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

  const updateSessionInFirestore = async (username, updatedSessions) => {
    const userDocRef = doc(db, 'users', username);
    await updateDoc(userDocRef, { sessions: updatedSessions });
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
        <CurrentSession
          sessions={sessions}
          setSessions={setSessions}
          exercises={exercises}
          user={user}
          updateSessionInFirestore={updateSessionInFirestore}
          calculateCalories={calculateCalories}
          calculateTotalCalories={calculateTotalCalories}
          startSession={startSession}
        />
        <div className='workout-sessions'>
          <div className='workout-sessions-title' onClick={() => {}}>
            <p className='sess-title'>History</p>
          </div>
          <div className='expandable-section'>
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <div key={index}>
                  <h3>Session Date: {new Date(session.date).toLocaleString()}</h3>
                  {session.exercises.map((exercise, exIndex) => (
                    <div key={exIndex}>
                      <p>{exercise.name}: {exercise.reps} reps, {exercise.laps} laps</p>
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