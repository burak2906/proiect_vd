import React from 'react';
import './App.css';

import BusinessSummary from './features/analytics/BusinessSummary';
import DecisionTreeChart from './features/analytics/DecisionTreeChart';
import RepeatOrderFactors from './features/analytics/RepeatOrderFactors';
import LowRatingRisk from './features/analytics/LowRatingRisk';
import DeliveryTimeModel from './features/analytics/DeliveryTimeModel';
import ValueDrivers from './features/analytics/ValueDrivers';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard Analiză Food Delivery</h1>
      </header>

      <main>
        <BusinessSummary />
        <DecisionTreeChart />
        <RepeatOrderFactors />
        <LowRatingRisk />
        <DeliveryTimeModel />
        <ValueDrivers />
      </main>
    </div>
  );
}

export default App;