import React from 'react';
import './App.css';
import KMeansChart from './features/analytics/K-Means';

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>Dashboard Proiect VD</h1>
      </header>
      
      <main style={{ padding: '20px' }}>
        <KMeansChart />
      </main>
    </div>
  );
}

export default App;