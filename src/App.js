import logo from './logo.svg';
import './App.css';
import Home from './pages/home';

function App() {
  return (
    <div className="App">
      <Home/>
      <a href="/admin">Access Admin Panel</a>
    </div>
  );
}

export default App;
