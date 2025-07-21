import React from 'react';
import { Trash2, Play } from 'react-feather';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/db';

function History({ sessions, setSessions, user, updateSessionInFirestore, exercises }) {
  const navigate = useNavigate();

  const reuseSession = (session) => {
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      const updatedSessions = [...sessions, { ...session, date: new Date().toISOString() }];
      setSessions(updatedSessions);
      updateSessionInFirestore(username, updatedSessions);
      navigate('/session', { state: { session: { ...session, date: new Date().toISOString() } } });
    }
  };

  const deleteSession = (index) => {
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      const updatedSessions = sessions.filter((_, i) => i !== index);
      setSessions(updatedSessions);
      updateSessionInFirestore(username, updatedSessions);
    }
  };

  return (
    <div>
      {sessions.length > 0 ? (
        sessions.map((session, index) => (
          <div key={index} className='history-item'>
            <h3>Session Date: {new Date(session.date).toLocaleString()}</h3>
            {session.exercises.map((exercise, exIndex) => (
              <p key={exIndex}>
                {exercise.name}: {exercise.type === 'cardio' ? `${exercise.duration} sec, ${exercise.laps} laps` : `${exercise.reps} reps, ${exercise.laps} laps, ${exercise.weight} kg`}
                <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="tutorial-link">Tutorial</a>
              </p>
            ))}
            <div className='history-buttons'>
              <button className='reuse-btn' onClick={() => reuseSession(session)}>
                <Play size={16} /> Reuse
              </button>
              <button className='delete-btn' onClick={() => deleteSession(index)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );
}

export default History;