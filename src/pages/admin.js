import React, { useState, useEffect } from 'react';
import { db } from '../firebase/db';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import './admin.css';

function Admin() {
  const [jsonData, setJsonData] = useState('[]');
  const [selectedId, setSelectedId] = useState('');
  const [displayAll, setDisplayAll] = useState(false);
  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJsonData(JSON.stringify(exercises, null, 2));
      setAllExercises(exercises);
    };
    fetchExercises();
  }, []);

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  const handleUpdate = async () => {
    try {
      const exercises = JSON.parse(jsonData);
      const batch = [];
      for (const exercise of exercises) {
        const exerciseId = exercise.id || exercise.name.toLowerCase().replace(/ /g, '-');
        batch.push({ id: exerciseId, data: exercise });
      }
      await Promise.all(batch.map(({ id, data }) => setDoc(doc(db, 'exercises', id), data, { merge: true })));
      alert('Exercises updated successfully!');
    } catch (error) {
      alert('Error updating exercises: ' + error.message);
    }
  };

  const handleCreate = () => {
    const newExercise = {
      name: 'New Exercise',
      type: 'cardio',
      muscleGroup: ['legs'],
      equipment: 'none',
      difficulty: 'easy',
      duration: 5,
      met: 6.0,
      description: 'New exercise description',
      videoUrl: 'https://example.com/videos/new',
      imageUrl: 'https://example.com/images/new.jpg'
    };
    const currentData = JSON.parse(jsonData);
    currentData.push(newExercise);
    setJsonData(JSON.stringify(currentData, null, 2));
  };

  const handleDelete = () => {
    if (!selectedId) {
      alert('Select an exercise ID to delete');
      return;
    }
    const currentData = JSON.parse(jsonData);
    const updatedData = currentData.filter(exercise => exercise.id !== selectedId && exercise.name.toLowerCase().replace(/ /g, '-') !== selectedId);
    setJsonData(JSON.stringify(updatedData, null, 2));
    setSelectedId('');
  };

  const handleDisplayAll = () => {
    setDisplayAll(!displayAll);
  };

  return (
    <div className='admin-page'>
      <h2>Admin - Manage Exercises</h2>
      <button onClick={handleDisplayAll}>{displayAll ? 'Hide All Exercises' : 'Display All Exercises'}</button>
      {displayAll && (
        <div className='exercise-list'>
          {allExercises.map((exercise) => (
            <div key={exercise.id} className='exercise-item'>
              <h3>{exercise.name} (ID: {exercise.id})</h3>
              <p>Type: {exercise.type}</p>
              <textarea
                value={JSON.stringify(exercise, null, 2)}
                onChange={(e) => {
                  const updatedExercises = allExercises.map(ex => ex.id === exercise.id ? JSON.parse(e.target.value) : ex);
                  setAllExercises(updatedExercises);
                  setJsonData(JSON.stringify(updatedExercises, null, 2));
                }}
                className='json-editor'
              />
            </div>
          ))}
        </div>
      )}
      <textarea value={jsonData} onChange={handleJsonChange} className='json-editor' />
      <div className='button-group'>
        <button onClick={handleCreate}>Create</button>
        <button onClick={handleUpdate}>Update</button>
        <input
          type='text'
          placeholder='Enter exercise ID to delete'
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        />
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}

export default Admin;
