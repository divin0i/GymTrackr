import React, { useState, useEffect } from 'react';
import { db } from '../firebase/db';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { X } from 'react-feather';
import './exerciseList.css';

function ExerciseList({ type }) {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const q = query(collection(db, 'exercises'), where('type', '==', type.toLowerCase()));
      const querySnapshot = await getDocs(q);
      const exerciseList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(exerciseList);
    };
    fetchExercises();
  }, [type]);

  const handleDelete = async (exerciseId) => {
    if (window.confirm(`Are you sure you want to delete ${exercises.find(e => e.id === exerciseId)?.name}?`)) {
      await deleteDoc(doc(db, 'exercises', exerciseId));
      setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
    }
  };

  return (
    <div className='exercise-list'>
      <h2>{type} Exercises</h2>
      {exercises.map((exercise) => (
        <div key={exercise.id} className='exercise-item'>
          <h3>{exercise.name}</h3>
          <p>{exercise.description}</p>
          <a href={exercise.videoUrl} target='_blank' rel='noopener noreferrer'>Watch Video</a>
          <button className='delete-btn' onClick={() => handleDelete(exercise.id)}>
            <X size={18} color="#ff4d4d" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ExerciseList;