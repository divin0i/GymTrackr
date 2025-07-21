import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import { ChevronLeft, User, Edit2, Trash2, Save, Settings, LogOut, Plus } from 'react-feather';
import logo from '../Assets/logo.png';
import { db, auth } from '../firebase/db';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { Chart } from 'chart.js/auto';
import CurrentSession from './CurrentSession';

function Home() {
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [calorieObjective, setCalorieObjective] = useState(1000); // Default calorie objective
  const [calorieObjectiveSetTime, setCalorieObjectiveSetTime] = useState(null); // Track when calorie goal was set
  const [history, setHistory] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exercises, setExercises] = useState([]);
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("N/A");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { objectives: [], history: [], sessions: [], calorieObjective: 1000, calorieObjectiveSetTime: null };
        setObjectives(userData.objectives || []);
        setHistory(userData.history || []);
        setSessions(userData.sessions || []);
        setCalorieObjective(userData.calorieObjective || 1000);
        setCalorieObjectiveSetTime(userData.calorieObjectiveSetTime || new Date().toISOString());
        setUserData(userData);

        const exerciseSnapshot = await getDocs(collection(db, 'exercises'));
        const exerciseList = exerciseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExercises(exerciseList);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    let timer;
    if (calorieObjectiveSetTime) {
      timer = setInterval(() => {
        const setTime = new Date(calorieObjectiveSetTime);
        const endTime = new Date(setTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from set time
        const now = new Date();
        const diffMs = endTime - now;
        if (diffMs <= 0) {
          setTimeRemaining("Expired");
        } else {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
          setTimeRemaining(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
        }
      }, 1000); // every second
    }
    return () => clearInterval(timer);
  }, [calorieObjectiveSetTime]); // Re-run when done

  useEffect(() => {
    const timer = setInterval(() => {
      setCalorieObjectiveSetTime(prev => prev); // Trigger re-render to update clock
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addObjective = () => {
    if (newObjective.trim() && user) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);
      const updatedObjectives = [...objectives, { text: newObjective.trim(), completed: false }];
      setObjectives(updatedObjectives);
      setNewObjective('');
      updateDoc(userDocRef, { objectives: updatedObjectives });
    }
  };

  const toggleObjective = (index) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index].completed = !updatedObjectives[index].completed;
    setObjectives(updatedObjectives);
    const username = user.displayName || user.email.split('@')[0];
    updateDoc(doc(db, 'users', username), { objectives: updatedObjectives });
  };

  const updateObjectiveText = (index, newText) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index].text = newText;
    setObjectives(updatedObjectives);
  };

  const clearObjectives = () => {
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      setObjectives([]);
      updateDoc(doc(db, 'users', username), { objectives: [] });
    }
  };

  const saveObjectives = () => {
    const username = user.displayName || user.email.split('@')[0];
    updateDoc(doc(db, 'users', username), { objectives });
    setIsEditing(false);
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
      const durationMinutes = exercise.duration || 1;
      return Math.round(met * userWeight * durationMinutes / 60);
    } else {
      const intensityFactor = exercise.intensity === 'high' ? 1.5 : exercise.intensity === 'medium' ? 1.0 : 0.5;
      const caloriesPerSet = (userWeight + (exercise.weight || 0)) * intensityFactor * 0.1;
      return Math.round(caloriesPerSet * (exercise.sets || 1));
    }
  };

  const calculateTotalCalories = () => {
    if (!sessions.length) return 0;
    const currentSession = sessions[sessions.length - 1];
    return currentSession.exercises.reduce((total, exercise) => total + calculateCalories(exercise), 0);
  };

  const startSession = () => {
    if (sessions.length > 0 && sessions[sessions.length - 1].exercises.length > 0) {
      navigate('/session', { state: { session: sessions[sessions.length - 1] } });
    }
  };

  const saveCalorieObjective = () => {
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);
      const now = new Date().toISOString();
      updateDoc(userDocRef, { calorieObjective, calorieObjectiveSetTime: now });
      setCalorieObjectiveSetTime(now); // Update local state immediately
    }
  };

  const getTimeRemaining = () => {
    return timeRemaining;
  };

  useEffect(() => {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    const totalBurned = history.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0);
    let myChart = Chart.getChart('calorieChart');
    if (myChart) myChart.destroy();

    new Chart(ctx, {
      type: 'pie',
      data: {
        datasets: [{
          data: [totalBurned, Math.max(0, calorieObjective - totalBurned)],
          backgroundColor: ['#28a745', '#e0e0e0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }, [calorieObjective, history]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className='home-page'>
      <div className='phone-container'>
        <div className='home-bar' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '-20px' }}>
          <div>
            <ChevronLeft className='chevron-icon' onClick={() => navigate(-1)} />
          </div>
          <div>
            <a href='/' className='logo-link'>
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
        <div className='home-message'>
          <h3 className='welcome-message'>Welcome, {user ? (user.displayName ? user.displayName : user.email.split('@')[0]) : 'User'}!</h3>
        </div>
        <div className='notepad-container'>
          <h2>Objectives</h2>
          <input
            type="text"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            placeholder="Add new objective"
            className="objective-input"
          />
          <div className='objectives-list'>
            {objectives.map((obj, index) => (
              <div
                key={index}
                className={`objective-item ${obj.completed ? 'completed' : ''}`}
                onClick={() => !isEditing && toggleObjective(index)}
              >
                <input
                  type="checkbox"
                  checked={obj.completed}
                  onChange={() => !isEditing && toggleObjective(index)}
                  className='checkbox'
                  disabled={isEditing}
                />
                {isEditing ? (
                  <input
                    type="text"
                    value={obj.text}
                    onChange={(e) => updateObjectiveText(index, e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{obj.text}</span>
                )}
              </div>
            ))}
          </div>
          <div className='notepad-controls'>
            <Edit2 className='edit-icon' onClick={() => setIsEditing(true)} />
            <Trash2 className='delete-icon' onClick={clearObjectives} />
            {isEditing && <Save className='save-icon' onClick={saveObjectives} />}
          </div>
        </div>
        <div className='chart-section'>
          <div className='clock-container'>
            <div className='clock-row' style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span className='clock-label'>Time Remaining</span>
              <span className='clock-value'>{getTimeRemaining()}</span>
            </div>
          </div>
          <div className='chart-wrapper'>
            <canvas id="calorieChart" height="200"></canvas>
          </div>
          <div className='legend'>
            <div className='legend-item'><span className='color-box' style={{ backgroundColor: '#28a745' }}></span>Set Calories: {calorieObjective} kcal</div>
            <div className='legend-item'><span className='color-box' style={{ backgroundColor: '#e0e0e0' }}></span>Remaining: {Math.max(0, calorieObjective - history.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0))} kcal</div>
            <div className='legend-item'><span className='color-box' style={{ backgroundColor: '#28a745' }}></span>Burned: {history.reduce((sum, entry) => sum + (entry.totalCalories || 0), 0)} kcal</div>
          </div>
        </div>
        <div className='calorie-settings'>
          <label htmlFor="calorie-input">Set Calorie Goal: </label>
          <input
            type="number"
            id="calorie-input"
            value={calorieObjective}
            onChange={(e) => setCalorieObjective(parseInt(e.target.value) || 0)}
            min="0"
            className="calorie-input"
          />
          <button onClick={saveCalorieObjective} className="save-calorie-btn">Save</button>
        </div>
        <div className='bottom-buttons'>
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
          <button className='workout-btn' onClick={() => navigate('/workout')}>Workout</button>
        </div>
        <div>
          <button className='add-exercise-btn' onClick={() => navigate('/add-exercise')}>
            Create Exercise
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;