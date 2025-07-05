import { useState } from 'react';
import logo from './assets/logo.png'; // 🔴 Make sure logo is present
import './index.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <header className="app-header">
        <img src={logo} alt="Logo" className="header-logo" />
      </header>

      <main className="app-content">
        <div className="card">
          <h1>Vite + React</h1>
          <button onClick={() => setCount((c) => c + 1)}>
            Count is {count}
          </button>
          <p>Click logo to test header!</p>
        </div>
      </main>
    </>
  );
}

export default App;
