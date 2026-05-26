import React, { useState } from 'react';
import './App.css';

import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';

import BusinessSummary from './features/analytics/BusinessSummary';
import DecisionTreeChart from './features/analytics/DecisionTreeChart';
import RepeatOrderFactors from './features/analytics/RepeatOrderFactors';
import HighRatingDrivers from './features/analytics/HighRatingDrivers';
import DeliveryTimeModel from './features/analytics/DeliveryTimeModel';
import ValueDrivers from './features/analytics/ValueDrivers';

import RepeatOrderPredictionForm from './features/predictions/RepeatOrderPredictionForm';
import DeliveryTimePredictionForm from './features/predictions/DeliveryTimePredictionForm';

const PAGE_TITLES = {
  Overview:    { eyebrow: 'Dashboard', title: 'Business Overview' },
  Customers:   { eyebrow: 'Analiză', title: 'Comportament Clienți' },
  Ratings:     { eyebrow: 'Satisfacție', title: 'Analiza Ratingurilor' },
  Delivery:    { eyebrow: 'Logistică', title: 'Timp de Livrare' },
  Predictions: { eyebrow: 'Machine Learning', title: 'Predicții' },
};

function App() {
  const [activePage, setActivePage] = useState('Overview');
  const { eyebrow, title } = PAGE_TITLES[activePage];

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="app-main">
        <Topbar eyebrow={eyebrow} title={title} />

        <main className="dashboard-content">

          {activePage === 'Overview' && (
            <>
              <BusinessSummary />
              <div className="dashboard-grid two-columns">
                <RepeatOrderFactors />
                <ValueDrivers />
              </div>
            </>
          )}

          {activePage === 'Customers' && (
            <>
              <div className="dashboard-grid single-column">
                <DecisionTreeChart />
              </div>
              <div className="dashboard-grid single-column">
                <RepeatOrderPredictionForm />
              </div>
            </>
          )}

          {activePage === 'Ratings' && (
            <div className="dashboard-grid single-column">
              <HighRatingDrivers />
            </div>
          )}

          {activePage === 'Delivery' && (
            <>
              <div className="dashboard-grid single-column">
                <DeliveryTimeModel />
              </div>
              <div className="dashboard-grid single-column">
                <DeliveryTimePredictionForm />
              </div>
            </>
          )}

          {activePage === 'Predictions' && (
            <div className="dashboard-grid two-columns">
              <RepeatOrderPredictionForm />
              <DeliveryTimePredictionForm />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default App;