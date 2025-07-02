import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './user/login';
import Register from './user/register';
import Workout from './pages/workout';
import ExerciseList from './pages/exerciseList';
import Admin from './pages/admin';
import { auth } from './firebase/db';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        navigate('/login');
      }
    });
    return unsubscribe;
  }, [navigate]);

  return isAuthenticated ? children : null;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/workout",
    element: (
      <ProtectedRoute>
        <Workout />
      </ProtectedRoute>
    )
  },
  {
    path: "/cardio-exercise",
    element: (
      <ProtectedRoute>
        <ExerciseList type="Cardio" />
      </ProtectedRoute>
    )
  },
  {
    path: "/chest-exercise",
    element: (
      <ProtectedRoute>
        <ExerciseList type="Chest" />
      </ProtectedRoute>
    )
  },
  {
    path: "/abs-exercise",
    element: (
      <ProtectedRoute>
        <ExerciseList type="Abs" />
      </ProtectedRoute>
    )
  },
  {
    path: "/arms-exercise",
    element: (
      <ProtectedRoute>
        <ExerciseList type="Arms" />
      </ProtectedRoute>
    )
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    )
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
