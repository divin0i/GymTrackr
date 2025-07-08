import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './session.css';
import { ChevronLeft } from 'react-feather';
import { db, auth } from '../firebase/db';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = location.state || { session: { exercises: [] } };
  const [exerciseStates, setExerciseStates] = useState({});
  const [timerActive, setTimerActive] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [countdown, setCountdown] = useState({});
  const user = auth.currentUser;
  const timerRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [] };
        const currentSession = userData.sessions.find(s => s === session) || session;
        const initialStates = {};
        currentSession.exercises.forEach((exercise, index) => {
          initialStates[index] = {
            reps: exercise.reps || 0,
            laps: exercise.laps || 1,
            weight: exercise.weight || 0,
            duration: exercise.duration || 0,
            isExpanded: exercise.isExpanded || false
          };
        });
        setExerciseStates(initialStates);
        setTimeLeft(prev => {
          const newTime = {};
          currentSession.exercises.forEach((_, index) => {
            newTime[index] = exerciseStates[index]?.duration || 0;
          });
          return newTime;
        });
        setCountdown(prev => {
          const newCountdown = {};
          currentSession.exercises.forEach((_, index) => {
            newCountdown[index] = exerciseStates[index]?.isExpanded && !timerActive[index] ? 3 : 0;
          });
          return newCountdown;
        });
      }
    };
    fetchData();
  }, [session, user]);

  // Real-time countdown effect
  useEffect(() => {
    const timers = {};
    Object.keys(countdown).forEach(index => {
      if (countdown[index] > 0) {
        console.log(`[Countdown] Starting for index ${index}: ${countdown[index]}s`);
        timers[index] = setInterval(() => {
          setCountdown(prev => {
            const newCountdown = { ...prev, [index]: prev[index] - 1 };
            console.log(`[Countdown] Attempting decrement for index ${index}, Time Left: ${newCountdown[index]}s`);
            if (newCountdown[index] <= 0) {
              console.log(`[Countdown] Finished for index ${index}, Starting timer`);
              setTimerActive(prev => ({ ...prev, [index]: true }));
              setCountdown(prev => ({ ...prev, [index]: 0 }));
              startDurationTimer(index); // Start timer after countdown
            }
            return newCountdown;
          });
        }, 1000);
      }
    });
    return () => Object.values(timers).forEach(timer => clearInterval(timer)); // Cleanup
  }, [countdown]);

  // Function to start and manage duration timer
  const startDurationTimer = (index) => {
    if (timerActive[index] && timeLeft[index] > 0 && !timerRefs.current[index]) {
      console.log(`[Timer] Starting for index ${index}, Initial Time: ${timeLeft[index]}s`);
      timerRefs.current[index] = setInterval(() => {
        setTimeLeft(prev => {
          const currentTime = prev[index] || 0;
          const newTime = currentTime - 1;
          console.log(`[Timer] Attempting decrement for index ${index}, Current Time: ${currentTime}s, New Time: ${newTime}s, Active: ${timerActive[index]}`);
          if (newTime <= 0) {
            console.log(`[Timer] Finished for index ${index}, Time Left: 0s`);
            clearInterval(timerRefs.current[index]);
            timerRefs.current[index] = null;
            setTimerActive(prev => ({ ...prev, [index]: false }));
          }
          updateExercise(index, 'duration', newTime);
          return { ...prev, [index]: newTime };
        });
      }, 1000);
    }
  };

  // Real-time duration timer effect (triggers start)
  useEffect(() => {
    Object.keys(timerActive).forEach(index => {
      if (timerActive[index] && timeLeft[index] > 0) {
        startDurationTimer(index);
      } else if (timeLeft[index] <= 0 && timerRefs.current[index]) {
        console.log(`[Timer] Clearing interval for index ${index} due to time expiry`);
        clearInterval(timerRefs.current[index]);
        timerRefs.current[index] = null;
      }
    });
  }, [timerActive, timeLeft]);

  const pauseTimer = (index) => {
    console.log(`[Timer] Pausing for index ${index}, Time Left: ${timeLeft[index]}s`);
    clearInterval(timerRefs.current[index]);
    timerRefs.current[index] = null;
    setTimerActive(prev => ({ ...prev, [index]: false }));
  };

  const resumeTimer = (index) => {
    console.log(`[Timer] Resuming for index ${index}, Time Left: ${timeLeft[index]}s`);
    setTimerActive(prev => ({ ...prev, [index]: true }));
    startDurationTimer(index);
  };

  const toggleExpand = (index) => {
    setExerciseStates(prev => {
      const newState = {
        ...prev,
        [index]: { ...prev[index], isExpanded: !prev[index].isExpanded }
      };
      if (user && session.exercises.length > 0) {
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        getDoc(userDocRef).then(userDocSnap => {
          const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [] };
          const updatedSessions = userData.sessions.map(s =>
            s === session ? { ...s, exercises: s.exercises.map((e, i) => i === index ? { ...e, isExpanded: newState[index].isExpanded } : e) } : s
          );
          updateDoc(userDocRef, { sessions: updatedSessions });
        });
      }
      if (newState[index].isExpanded && session.exercises[index].type === 'cardio') {
        setCountdown(prev => ({ ...prev, [index]: 3 }));
        setTimeLeft(prev => ({ ...prev, [index]: newState[index].duration || 0 }));
        setTimerActive(prev => ({ ...prev, [index]: false }));
        clearInterval(timerRefs.current[index]);
        timerRefs.current[index] = null;
      }
      return newState;
    });
  };

  const updateExercise = (index, field, value) => {
    setExerciseStates(prev => {
      const newState = { ...prev, [index]: { ...prev[index], [field]: value } };
      if (user && session.exercises.length > 0) {
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        getDoc(userDocRef).then(userDocSnap => {
          const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [] };
          const updatedSessions = userData.sessions.map(s =>
            s === session ? { ...s, exercises: s.exercises.map((e, i) => i === index ? { ...e, ...newState[index] } : e) } : s
          );
          updateDoc(userDocRef, { sessions: updatedSessions });
        });
      }
      return newState;
    });
  };

  const endSession = async () => {
    if (user && session.exercises.length > 0) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [], history: [] };
      const totalCalories = session.exercises.reduce((total, exercise, index) =>
        total + calculateCalories({ ...exercise, ...exerciseStates[index] }), 0
      );
      const newHistoryEntry = {
        date: new Date().toISOString(),
        exercises: session.exercises.map((exercise, index) => ({
          ...exercise,
          ...exerciseStates[index],
          isCompleted: true
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
    const userWeight = 70;
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

  const calculateTotalCheckedCalories = () => {
    return session.exercises.reduce((total, exercise, index) =>
      total + calculateCalories({ ...exercise, ...exerciseStates[index] }), 0
    );
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
            <div key={index} className={`checklist-item ${exerciseStates[index]?.isExpanded ? 'expanded' : ''}`}>
              <div className='checkbox-container'>
                <input
                  type="checkbox"
                  checked={exerciseStates[index]?.isExpanded || false}
                  onChange={() => toggleExpand(index)}
                  className='checkbox'
                />
                <p>{exercise.name}: {exercise.type === 'cardio' ? `${Math.floor((exerciseStates[index]?.duration || 0) / 60)} min ${exerciseStates[index]?.duration % 60} sec, ${exerciseStates[index]?.laps || 0} laps` : `${exerciseStates[index]?.reps || 0} reps, ${exerciseStates[index]?.laps || 0} laps, ${exerciseStates[index]?.weight || 0} kg`}</p>
              </div>
              {exercise.type === 'cardio' && exerciseStates[index]?.isExpanded && (
                <div className='trapezium-timer'>
                  {countdown[index] > 0 ? (
                    <span className="timer-text">Starting in: {countdown[index]}s</span>
                  ) : (
                    <>
                      <span className="timer-text">Time Left: {Math.floor((timeLeft[index] || 0) / 60)}:{(timeLeft[index] % 60).toString().padStart(2, '0')}</span>
                      {timerActive[index] && timeLeft[index] > 0 && (
                        <button onClick={() => pauseTimer(index)}>Pause</button>
                      )}
                      {!timerActive[index] && timeLeft[index] > 0 && (
                        <button onClick={() => resumeTimer(index)}>Resume</button>
                      )}
                    </>
                  )}
                </div>
              )}
              {exercise.type !== 'cardio' && exerciseStates[index]?.isExpanded && (
                <div className='exercise-controls'>
                  <input
                    type="number"
                    value={exerciseStates[index]?.reps || 0}
                    onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                    placeholder="Reps"
                    min="0"
                  />
                  <input
                    type="number"
                    value={exerciseStates[index]?.laps || 1}
                    onChange={(e) => updateExercise(index, 'laps', parseInt(e.target.value) || 1)}
                    placeholder="Laps"
                    min="1"
                  />
                  <input
                    type="number"
                    value={exerciseStates[index]?.weight || 0}
                    onChange={(e) => updateExercise(index, 'weight', parseInt(e.target.value) || 0)}
                    placeholder="Weight (kg)"
                    min="0"
                  />
                </div>
              )}
              <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="tutorial-link">Tutorial</a>
            </div>
          ))}
        </div>
        <div className='phone-bottom-bar'>
          <button className='end-btn' onClick={endSession}>End</button>
          <div className='total-checked-calories'>
            <span>Total Calories: {calculateTotalCheckedCalories()} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Session;