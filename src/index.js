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
    element: <Workout />
  },
  {
    path: "/cardio-exercise",
    element: <ExerciseList type="Cardio" />
  },
  {
    path: "/chest-exercise",
    element: <ExerciseList type="Chest" />
  },
  {
    path: "/abs-exercise",
    element: <ExerciseList type="Abs" />
  },
  {
    path: "/arms-exercise",
    element: <ExerciseList type="Arms" />
   },
   {
    path: "/admin",
    element: <Admin />
   }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
