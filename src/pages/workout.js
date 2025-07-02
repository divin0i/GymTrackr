import React, { useState, useEffect } from 'react';
import './workout.css';
import { ChevronLeft } from 'react-feather';
import logo from '../Assets/logo.png';
import Cardio from '../Assets/absd.png';
import Chest from '../Assets/chest.png';
import Abs from '../Assets/abs.png';
import Arms from '../Assets/arms.png';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/db';
import { doc, getDoc } from 'firebase/firestore';

function Workout() {
  const navigate = useNavigate();
  const [showCurrentSession, setShowCurrentSession] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [] };
        setSessions(userData.sessions || []);
      }
    };
    fetchSessions();
  }, [user]);

  const handleSectionClick = (type) => {
    navigate(`/${type.toLowerCase()}-exercise`);
  };

  const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  return (
    <div className='workout-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <ChevronLeft className='chevron-icon' />
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
          <a href='/' className='logo-link'>
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
                  <p key={index}>{exercise.name}: {exercise.reps} reps, {exercise.laps} laps</p>
                ))}
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
                    <p key={exIndex}>{exercise.name}: {exercise.reps} reps, {exercise.laps} laps</p>
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