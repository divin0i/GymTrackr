import logo from './logo.svg';
import './App.css';
import Register  from './user/register';
import Login from './user/login';
import Frame from './phone-frame';
import Workout from './pages/workout';

function App() {
  return (
    <div className="App">
      {/* <Register /> */}
      {/* <Login /> */}
      <Workout />
      <a href="/admin">Access Admin Panel</a>
    </div>
  );
}

export default App;
