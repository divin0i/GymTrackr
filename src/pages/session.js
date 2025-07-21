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
  const [breatherActive, setBreatherActive] = useState({});
  const [breatherTimeLeft, setBreatherTimeLeft] = useState({});
  const user = auth.currentUser;
  const timerRefs = useRef({});
  const breatherRefs = useRef({});

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
          const durationInSeconds = exercise.duration || 0; // Ensure duration is in seconds
          initialStates[index] = {
            reps: exercise.reps || 0,
            laps: exercise.laps || 1,
            weight: exercise.weight || 0,
            duration: durationInSeconds,
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
        setBreatherTimeLeft(prev => {
          const newBreather = {};
          currentSession.exercises.forEach((_, index) => {
            newBreather[index] = exerciseStates[index]?.duration ? Math.floor(exerciseStates[index].duration / 2) : 0;
          });
          return newBreather;
        });
      }
    };
    fetchData();
  }, [session, user]);

  // Countdown effect
  useEffect(() => {
    const timers = {};
    Object.keys(countdown).forEach(index => {
      if (countdown[index] > 0) {
        timers[index] = setInterval(() => {
          setCountdown(prev => {
            const newCountdown = { ...prev, [index]: prev[index] - 1 };
            if (newCountdown[index] <= 0) {
              setTimerActive(prev => ({ ...prev, [index]: true }));
              setCountdown(prev => ({ ...prev, [index]: 0 }));
              startDurationTimer(index);
            }
            return newCountdown;
          });
        }, 1000);
      }
    });
    return () => Object.values(timers).forEach(timer => clearInterval(timer));
  }, [countdown]);

  // Duration timer
  const startDurationTimer = (index) => {
    if (timerActive[index] && timeLeft[index] > 0 && !timerRefs.current[index]) {
      timerRefs.current[index] = setInterval(() => {
        setTimeLeft(prev => {
          const currentTime = prev[index] || 0;
          const newTime = currentTime - 1;
          if (newTime <= 0) {
            const laps = exerciseStates[index]?.laps || 0;
            if (laps > 1) {
              updateExercise(index, 'laps', laps - 1);
              setTimeLeft(prev => ({ ...prev, [index]: exerciseStates[index].duration || 0 }));
              setTimerActive(prev => ({ ...prev, [index]: false }));
              clearInterval(timerRefs.current[index]);
              timerRefs.current[index] = null;
              startBreatherTimer(index);
            } else if (laps === 1) {
              updateExercise(index, 'laps', 0);
              setTimerActive(prev => ({ ...prev, [index]: false }));
              clearInterval(timerRefs.current[index]);
              timerRefs.current[index] = null;
            }
          }
          updateExercise(index, 'duration', newTime);
          return { ...prev, [index]: newTime };
        });
      }, 1000);
    }
  };

  // Breather timer
  const startBreatherTimer = (index) => {
    if (!breatherActive[index] && breatherTimeLeft[index] > 0 && !breatherRefs.current[index]) {
      setBreatherActive(prev => ({ ...prev, [index]: true }));
      breatherRefs.current[index] = setInterval(() => {
        setBreatherTimeLeft(prev => {
          const currentBreather = prev[index] || 0;
          const newBreather = currentBreather - 1;
          if (newBreather <= 0) {
            setBreatherActive(prev => ({ ...prev, [index]: false }));
            clearInterval(breatherRefs.current[index]);
            breatherRefs.current[index] = null;
            setTimerActive(prev => ({ ...prev, [index]: true }));
            startDurationTimer(index);
          }
          return { ...prev, [index]: newBreather };
        });
      }, 1000);
    }
  };

  // Real-time timer effects
  useEffect(() => {
    Object.keys(timerActive).forEach(index => {
      if (timerActive[index] && timeLeft[index] > 0) startDurationTimer(index);
      else if (timeLeft[index] <= 0 && timerRefs.current[index]) {
        clearInterval(timerRefs.current[index]);
        timerRefs.current[index] = null;
      }
    });
  }, [timerActive, timeLeft]);

  useEffect(() => {
    Object.keys(breatherActive).forEach(index => {
      if (breatherActive[index] && breatherTimeLeft[index] > 0) startBreatherTimer(index);
      else if (breatherTimeLeft[index] <= 0 && breatherRefs.current[index]) {
        clearInterval(breatherRefs.current[index]);
        breatherRefs.current[index] = null;
      }
    });
  }, [breatherActive, breatherTimeLeft]);

  const pauseTimer = (index) => {
    clearInterval(timerRefs.current[index]);
    timerRefs.current[index] = null;
    setTimerActive(prev => ({ ...prev, [index]: false }));
  };

  const resumeTimer = (index) => {
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

  // Calculate progress for circular animation
  const getProgress = (index) => {
    const totalDuration = exerciseStates[index]?.duration || 1;
    const currentTime = timeLeft[index] || 0;
    return totalDuration > 0 ? 1 - (currentTime / totalDuration) : 0;
  };

  // Celebration animation when all exercises are checked
  useEffect(() => {
    const allChecked = session.exercises.every((_, index) => exerciseStates[index]?.isExpanded);
    if (allChecked && session.exercises.length > 0) {
      const timerContainer = document.querySelector('.trapezium-timer');
      if (timerContainer) {
        // Create and animate stars
        for (let i = 0; i < 20; i++) {
          const star = document.createElement('div');
          star.className = 'celebration-star';
          star.style.left = `${Math.random() * 100}%`;
          star.style.animationDelay = `${Math.random() * 1}s`; // Staggered start
          timerContainer.appendChild(star);
        }

        // Remove stars and navigate after animation (3 seconds)
        const animationTimeout = setTimeout(() => {
          const stars = document.querySelectorAll('.celebration-star');
          stars.forEach(star => star.remove());

          if (user) {
            const username = user.displayName || user.email.split('@')[0];
            const userDocRef = doc(db, 'users', username);
            getDoc(userDocRef).then(userDocSnap => {
              const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [], history: [] };
              const updatedSessions = userData.sessions.filter(s => s !== session);
              updateDoc(userDocRef, { sessions: updatedSessions });
            });
          }
          navigate('/workout');
        }, 3000); // 3-second animation

        return () => clearTimeout(animationTimeout);
      }
    }
  }, [exerciseStates, session.exercises, user, navigate]);

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
                <p>
                  {exercise.name}: {exercise.type === 'cardio' 
                    ? `${Math.floor(exerciseStates[index]?.duration / 60 || 0)} min ${(exerciseStates[index]?.duration % 60).toString().padStart(2, '0')} sec, ${exerciseStates[index]?.laps || 0} laps`
                    : `${exerciseStates[index]?.reps || 0} reps, ${exerciseStates[index]?.laps || 0} laps, ${exerciseStates[index]?.weight || 0} kg`}
                </p>
              </div>
              {exercise.type === 'cardio' && exerciseStates[index]?.isExpanded && (
                <div className='trapezium-timer'>
                  {countdown[index] > 0 ? (
                    <span className="timer-text">Starting in: {countdown[index]}s</span>
                  ) : breatherActive[index] && breatherTimeLeft[index] > 0 ? (
                    <span className="timer-text">Breather: {Math.floor(breatherTimeLeft[index] / 60)}:{(breatherTimeLeft[index] % 60).toString().padStart(2, '0')}</span>
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