import React, { useState, useEffect } from 'react';
import './workout.css';
import { ChevronLeft, LogOut, Plus, Settings, User } from 'react-feather';
import logo from '../Assets/logo.png';
import Cardio from '../Assets/cardio.png';
import Chest from '../Assets/chest.png';
import Abs from '../Assets/abs.png';
import Arms from '../Assets/arms.png';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/db';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import CurrentSession from './CurrentSession';
import History from './History';

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
        const username = user.displayName || user.email?.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [], height: 0, weight: 0, age: 0, gender: '' };
        const namedSessions = (userData.sessions || []).map(session => ({
          ...session,
          name: session.name || `Session - ${new Date(session.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
        }));
        setUserData(userData);
        setSessions(namedSessions);

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

  const updateSessionInFirestore = async (username, updatedSessions) => {
    const userDocRef = doc(db, 'users', username);
    await updateDoc(userDocRef, { sessions: updatedSessions });
  };

  const calculateCalories = (exercise) => {
    if (!exercise || !exercise.minCalories) return 0;
    const userWeight = userData?.weight || 70;
    if (exercise.type === 'cardio') {
      const met = exercise.met || 3;
      const durationSeconds = exercise.duration || 1;
      const durationMinutes = durationSeconds / 60;
      return Math.round(met * userWeight * durationMinutes / 60);
    } else {
      const intensityFactor = exercise.intensity === 'high' ? 1.5 : exercise.intensity === 'medium' ? 1.0 : 0.5;
      const caloriesPerSet = (userWeight + (exercise.weight || 0)) * intensityFactor * 0.1;
      return Math.round(caloriesPerSet * (exercise.sets || 1));
    }
  };

  const calculateTotalCalories = () => {
    const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    if (!currentSession) return 0;
    return currentSession.exercises.reduce((total, exercise) => total + calculateCalories(exercise), 0);
  };

  const startSession = () => {
    const currentSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    if (currentSession && currentSession.exercises.length > 0) {
      navigate('/session', { state: { session: currentSession } });
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className='workout-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <div>
            <ChevronLeft className='chevron-icon' onClick={() => navigate(-1)} />
          </div>
          <div>
            <a href='/home' className='logo-link'>
              <img src={logo} alt='GymTrakr Logo' className='logo' />
            </a>
          </div>
          <div className='user-dropdown'>
            <User className='user-icon' onClick={() => setShowDropdown(!showDropdown)} />
            {showDropdown && (
              <div className='dropdown-menu'>
                <div className='dropdown-item' onClick={() => { navigate('/settings'); setShowDropdown(false); }}>
                  <Settings size={16} /> Settings
                </div>
                <div className='dropdown-item' onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='workout-sessions'>
          <CurrentSession
            sessions={sessions}
            setSessions={setSessions}
            exercises={exercises}
            user={user}
            updateSessionInFirestore={updateSessionInFirestore}
            calculateCalories={calculateCalories}
            calculateTotalCalories={calculateTotalCalories}
            startSession={startSession}
            showCurrentSession={showCurrentSession}
            setShowCurrentSession={setShowCurrentSession}
          />
          <div className='workout-sessions-title' onClick={() => setShowHistory(!showHistory)}>
            <p className='sess-title'>History</p>
          </div>
          <div className={showHistory ? 'expandable-section active' : 'expandable-section'}>
            <History sessions={sessions} setSessions={setSessions} user={user} updateSessionInFirestore={updateSessionInFirestore} exercises={exercises} />
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
