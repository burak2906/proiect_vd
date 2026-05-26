import React from 'react';
import './App.css';

import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';

import BusinessSummary from './features/analytics/BusinessSummary';
import DecisionTreeChart from './features/analytics/DecisionTreeChart';
import RepeatOrderFactors from './features/analytics/RepeatOrderFactors';
import LowRatingRisk from './features/analytics/LowRatingRisk';
import DeliveryTimeModel from './features/analytics/DeliveryTimeModel';
import ValueDrivers from './features/analytics/ValueDrivers';

import RepeatOrderPredictionForm from './features/predictions/RepeatOrderPredictionForm';
import DeliveryTimePredictionForm from './features/predictions/DeliveryTimePredictionForm';

function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="dashboard-content">
          <BusinessSummary />

          <div className="dashboard-grid two-columns">
            <DecisionTreeChart />
            <RepeatOrderFactors />
          </div>

          <div className="dashboard-grid two-columns">
            <LowRatingRisk />
            <DeliveryTimeModel />
          </div>

          <div className="dashboard-grid single-column">
            <ValueDrivers />
          </div>

          <div className="dashboard-grid two-columns">
            <RepeatOrderPredictionForm />
            <DeliveryTimePredictionForm />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;