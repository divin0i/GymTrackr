import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/db';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'; // Added setDoc
import { X, ChevronLeft } from 'react-feather';
import './exerciseList.css';

function ExerciseList({ type }) {
  const [exercises, setExercises] = useState([]);
  const [sessionData, setSessionData] = useState({});
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    const fetchExercises = async () => {
      let q;
      if (type.toLowerCase() === 'cardio') {
        q = query(collection(db, 'exercises'), where('type', '==', 'cardio'));
      } else {
        q = query(collection(db, 'exercises'), where('muscleGroup', 'array-contains', type.toLowerCase()));
      }
      const querySnapshot = await getDocs(q);
      const exerciseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(exerciseList);
      if (user) {
        const userDocRef = doc(db, 'users', user.displayName || user.email.split('@')[0]);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, { sessions: [] }, { merge: true });
        }
        const userData = userDocSnap.exists() ? userDocSnap.data() : { sessions: [] };
        setSessions(userData.sessions || []);
      }
    };
    fetchExercises();
  }, [type, user]);

  const handleRepsChange = (exerciseId, delta) => {
    setSessionData(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], reps: Math.max(0, (prev[exerciseId]?.reps || 0) + delta) }
    }));
  };

  const handleLapsChange = (exerciseId, delta) => {
    setSessionData(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], laps: Math.max(0, (prev[exerciseId]?.laps || 0) + delta) }
    }));
  };

  const handleDurationChange = (exerciseId, value) => {
    setSessionData(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], duration: Math.max(0, parseInt(value) || 0) }
    }));
  };

  const handleWeightChange = (exerciseId, value) => {
    setSessionData(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], weight: Math.max(0, parseInt(value) || 0) }
    }));
  };

  const handleAddToNewSession = async () => {
    if (!user) return;
    const username = user.displayName || user.email.split('@')[0];
    const newSession = {
      date: new Date().toISOString(),
      name: `Session - ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      exercises: Object.entries(sessionData).map(([id, data]) => {
        const exercise = exercises.find(e => e.id === id);
        return {
          id,
          name: exercise.name || 'Unnamed Exercise',
          reps: data.reps || (exercise.type === 'cardio' ? 0 : undefined),
          duration: data.duration || (exercise.type !== 'cardio' ? 0 : undefined),
          laps: data.laps || 0,
          weight: data.weight || (exercise.type === 'cardio' ? 0 : undefined),
          videoUrl: exercise.videoUrl || '',
          minCalories: exercise.minCalories || 10,
          type: exercise.type || 'strength',
          met: exercise.met || (exercise.type === 'cardio' ? 3 : undefined),
          sets: exercise.sets || 1
        };
      }).filter(e => (e.type === 'cardio' ? e.duration > 0 : e.reps > 0 && e.weight > 0) || e.laps > 0)
    };
    const updatedSessions = [...sessions, newSession];
    await updateDoc(doc(db, 'users', username), { sessions: updatedSessions });
    setSessions(updatedSessions);
    setSessionData({});
    alert('Added to new session!');
  };

  const handleAddToExistingSession = async () => {
    if (!user || !selectedSession) return;
    const username = user.displayName || user.email.split('@')[0];
    const sessionIndex = sessions.findIndex(s => s.date === selectedSession);
    if (sessionIndex === -1) return;
    const updatedSession = {
      ...sessions[sessionIndex],
      exercises: [
        ...sessions[sessionIndex].exercises,
        ...Object.entries(sessionData).map(([id, data]) => {
          const exercise = exercises.find(e => e.id === id);
          return {
            id,
            name: exercise.name || 'Unnamed Exercise',
            reps: data.reps || (exercise.type === 'cardio' ? 0 : undefined),
            duration: data.duration || (exercise.type !== 'cardio' ? 0 : undefined),
            laps: data.laps || 0,
            weight: data.weight || (exercise.type === 'cardio' ? 0 : undefined),
            videoUrl: exercise.videoUrl || '',
            minCalories: exercise.minCalories || 10,
            type: exercise.type || 'strength',
            met: exercise.met || (exercise.type === 'cardio' ? 3 : undefined),
            sets: exercise.sets || 1
          };
        }).filter(e => (e.type === 'cardio' ? e.duration > 0 : e.reps > 0 && e.weight > 0) || e.laps > 0)
      ]
    };
    const updatedSessions = sessions.map((s, i) => i === sessionIndex ? updatedSession : s);
    await updateDoc(doc(db, 'users', username), { sessions: updatedSessions });
    setSessions(updatedSessions);
    setSessionData({});
    alert('Added to existing session!');
  };

  const handleDelete = async (exerciseId) => {
    if (!user || !window.confirm(`Are you sure you want to delete ${exercises.find(e => e.id === exerciseId)?.name}?`)) return;
    const username = user.displayName || user.email.split('@')[0];
    const userDocRef = doc(db, 'users', username);

    try {
      console.log('Attempting to delete exercise with ID:', exerciseId);
      // Delete the exercise from the exercises collection
      await deleteDoc(doc(db, 'exercises', exerciseId));
      console.log('Exercise deleted from exercises collection');

      // Fetch the latest user document to ensure we have the current sessions
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const originalSessions = userData.sessions || [];
        console.log('Original sessions count:', originalSessions.length);

        // Update sessions to remove the deleted exercise
        const updatedSessions = originalSessions.map(session => ({
          ...session,
          exercises: session.exercises.filter(e => e.id !== exerciseId)
        }));
        console.log('Updated sessions count:', updatedSessions.length);
        console.log('Exercises removed for ID:', exerciseId);

        // Update the users document with the new sessions
        await updateDoc(userDocRef, { sessions: updatedSessions });
        console.log('Users document updated with new sessions');

        // Re-fetch sessions to sync local state
        const refreshedDocSnap = await getDoc(userDocRef);
        const refreshedSessions = refreshedDocSnap.exists() ? refreshedDocSnap.data().sessions || [] : [];
        setSessions(refreshedSessions);
        console.log('Local sessions updated, new count:', refreshedSessions.length);

        // Update local exercises list
        setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
        console.log('Local exercises updated');

        alert('Exercise deleted successfully!');
      } else {
        console.error('User document not found');
        alert('Failed to find user data.');
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Failed to delete exercise. Check console for details.');
    }
  };

  return (
    <div className='exerciseList-page'>
      <div className='phone-container'>
        <div className='phone-bar'>
          <button className='back-btn' onClick={() => window.history.back()}>
            <ChevronLeft className='chevron-icon' />
          </button>
          <div className='phone-bar'>
            <h1 className='top_bar'></h1>
          </div>
        </div>
        <div className='exercise-actions'>
          <button onClick={handleAddToNewSession}>Add to New Session</button>
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
            <option value="">Select Session</option>
            {sessions.map((session, index) => (
              <option key={index} value={session.date}>{session.name || new Date(session.date).toLocaleDateString()}</option>
            ))}
          </select>
          <button onClick={handleAddToExistingSession} disabled={!selectedSession}>Add to Existing Session</button>
        </div>
        <div className='exercise-content'>
          <h2>{type} Exercises</h2>
          {exercises.map((exercise) => (
            <div key={exercise.id} className='exercise-item'>
              <h3>{exercise.name}</h3>
              <div className='counter-group'>
                {exercise.type === 'cardio' ? (
                  <div className='counter-row'>
                    <div>
                      <span>Duration: </span>
                      <input
                        type="number"
                        value={sessionData[exercise.id]?.duration || 0}
                        onChange={(e) => handleDurationChange(exercise.id, e.target.value)}
                        min="0"
                        className="duration-input"
                      />
                      <span> sec</span>
                    </div>
                    <div>
                      <button onClick={() => handleLapsChange(exercise.id, -1)}>-</button>
                      <span>Laps: {sessionData[exercise.id]?.laps || 0}</span>
                      <button onClick={() => handleLapsChange(exercise.id, 1)}>+</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='counter-row'>
                      <div>
                        <button onClick={() => handleRepsChange(exercise.id, -1)}>-</button>
                        <span>Reps: {sessionData[exercise.id]?.reps || 0}</span>
                        <button onClick={() => handleRepsChange(exercise.id, 1)}>+</button>
                      </div>
                      <div>
                        <button onClick={() => handleLapsChange(exercise.id, -1)}>-</button>
                        <span>Laps: {sessionData[exercise.id]?.laps || 0}</span>
                        <button onClick={() => handleLapsChange(exercise.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className='counter-row'>
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={sessionData[exercise.id]?.weight || 0}
                          onChange={(e) => handleWeightChange(exercise.id, e.target.value)}
                          className="weight-slider"
                        />
                        <span>Weight: {sessionData[exercise.id]?.weight || 0} kg</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button className='delete-btn' onClick={() => handleDelete(exercise.id)}>
                <X size={18} color="#ff4d4d" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExerciseList;