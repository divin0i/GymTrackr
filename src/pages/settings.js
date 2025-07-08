import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './settings.css';
import { ChevronLeft, Edit } from 'react-feather';
import logo from '../Assets/logo.png';
import { db, auth } from '../firebase/db';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

function Settings() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null); // Start with null to handle loading
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        const username = user.displayName || user.email.split('@')[0];
        const userDocRef = doc(db, 'users', username);
        const userDocSnap = await getDoc(userDocRef);
        const data = userDocSnap.exists() ? userDocSnap.data() : {};
        setUserData({
          displayName: user.displayName || username,
          email: user.email,
          weight: data.weight || 0,
          height: data.height || 0,
          age: data.age || 0,
          password: '' // Not fetched, handled via auth
        });
        setLoading(false);
        console.log('Fetched data:', data);
        // print user data to console for debugging
        console.log('User data:', {
          displayName: user.displayName,
          email: user.email,
          weight: data.weight || 0,
          height: data.height || 0,
          age: data.age || 0
        });
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!userData || userData === null) return; // Prevent save if data not loaded
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);

      if (newPassword && (!currentPassword || newPassword.length < 6 || newPassword !== confirmPassword)) {
        setMessage('Error: New password must be at least 6 characters and match the confirmation. Current password is required for changes.');
        return;
      }

      try {
        let updatedData = {
          displayName: userData.displayName,
          weight: parseInt(userData.weight) || 0,
          height: parseInt(userData.height) || 0,
          age: parseInt(userData.age) || 0
        };
        if (newPassword) {
          const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);
          await auth.currentUser.reauthenticateWithCredential(credential);
          await auth.currentUser.updatePassword(newPassword);
          updatedData = { ...updatedData, passwordUpdated: new Date().toISOString() }; // Optional flag
        }
        await updateDoc(userDocRef, updatedData);
        setMessage('Settings saved successfully!');
        setIsEditing(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(`Error: ${error.message.includes('wrong-password') ? 'Incorrect current password.' : error.message}`);
      }
    }
  };

  const handleChange = (field, value) => {
    setUserData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleCancel = () => {
    if (user) {
      const username = user.displayName || user.email.split('@')[0];
      const userDocRef = doc(db, 'users', username);
      getDoc(userDocRef).then((docSnap) => {
        const data = docSnap.exists() ? docSnap.data() : {};
        setUserData({
          displayName: user.displayName || username,
          email: user.email,
          weight: data.weight || 0,
          height: data.height || 0,
          age: data.age || 0,
          password: '' // Not fetched, handled via auth
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditing(false);
        setMessage('');
      });
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (user) {
        try {
          const username = user.displayName || user.email.split('@')[0];
          const userDocRef = doc(db, 'users', username);
          await deleteDoc(userDocRef);
          await auth.currentUser.delete();
          navigate('/login');
          setMessage('Account deleted successfully.');
        } catch (error) {
          setMessage(`Error: ${error.message.includes('requires-recent-login') ? 'Please log in again to delete your account.' : error.message}`);
        }
      }
    }
  };

  if (loading) {
    return <div className='settings-page'>Loading...</div>; // Simple loading state
  }

  return (
    <div className='settings-page'>
      <div className='phone-container'>
        <div className='settings-bar'>
          <ChevronLeft className='chevron-icon' onClick={() => navigate(-1)} />
          <div className='logo-link' onClick={() => navigate('/home')}>
            <img src={logo} alt='GymTrakr Logo' className='logo' />
          </div>
        </div>
        <div className='settings-content'>
          <h2>Settings</h2>
        <div className='settings-form'>
            <div className='form-group'>
                <label>Name:</label>
                <input
                type="text"
                value={userData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                className="settings-input"
                readOnly={!isEditing}
                />
            </div>
            <div className='form-group'>
                <label>Email:</label>
                <input
                type="email"
                value={userData.email}
                className="settings-input"
                readOnly
                />
            </div>
            <div className='form-group'>
                <label>Weight (kg):</label>
                {isEditing ? (
                <>
                    <input
                    type="range"
                    value={userData.weight}
                    onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                    min="30"
                    max="200"
                    step="1"
                    className="slider-input"
                    />
                    <span className="slider-value">{userData.weight} kg</span>
                </>
                ) : (
                <input
                    type="number"
                    value={userData.weight}
                    readOnly
                    className="settings-input"
                />
                )}
            </div>
            <div className='form-group'>
                <label>Height (cm):</label>
                {isEditing ? (
                <>
                    <input
                    type="range"
                    value={userData.height}
                    onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                    min="100"
                    max="250"
                    step="1"
                    className="slider-input"
                    />
                    <span className="slider-value">{userData.height} cm</span>
                </>
                ) : (
                <input
                    type="number"
                    value={userData.height}
                    readOnly
                    className="settings-input"
                />
                )}
            </div>
            <div className='form-group'>
                <label>Age:</label>
                {isEditing ? (
                <>
                    <input
                    type="range"
                    value={userData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                    min="10"
                    max="100"
                    step="1"
                    className="slider-input"
                    />
                    <span className="slider-value">{userData.age} yrs</span>
                </>
                ) : (
                <input
                    type="number"
                    value={userData.age}
                    readOnly
                    className="settings-input"
                />
                )}
            </div>
            <div className='form-group'>
                <label>Current Password:</label>
                <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="settings-input"
                readOnly={!isEditing}
                />
            </div>
            <div className='form-group'>
                <label>New Password:</label>
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="settings-input"
                readOnly={!isEditing}
                />
            </div>
            <div className='form-group'>
                <label>Confirm New Password:</label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="settings-input"
                readOnly={!isEditing}
                />
            </div>
            <div className='edit-save'>
                {isEditing ? (
                <div className='button-group'>
                    <button onClick={handleSave} className="save-settings-btn">Save Changes</button>
                    <button onClick={handleCancel} className="cancel-settings-btn">Cancel Edit</button>
                </div>
                ) : (
                <button onClick={() => setIsEditing(true)} className="edit-settings-btn">
                    Edit Settings <Edit size={16} style={{ marginLeft: '10px', transform: 'translateY(2px)' }} />
                </button>
                )}
                {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
                <div className='account-actions'>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
                <button onClick={handleDeleteAccount} className="del-btn">Delete Account</button>
                </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;