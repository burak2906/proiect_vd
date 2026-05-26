import React, { useState } from 'react';
import './App.css';

import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';

import AvgOrderValueByCuisine from './features/analytics/AvgOrderValueByCuisine';
import AvgOrderValueByCity from './features/analytics/AvgOrderValueByCity';
import AvgOrderValueByMood from './features/analytics/AvgOrderValueByMood';
import AvgRatingByRepeatOrder from './features/analytics/AvgRatingByRepeatOrder';
import KeyInsights from './features/analytics/KeyInsights';
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
  const [dayFilter, setDayFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');

  const { eyebrow, title } = PAGE_TITLES[activePage];
  const filters = { dayFilter, timeFilter };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setDayFilter('');
          setTimeFilter('');
        }}
      />

      <div className="app-main">
        <Topbar
          eyebrow={eyebrow}
          title={title}
          dayFilter={dayFilter}
          timeFilter={timeFilter}
          onDayFilter={setDayFilter}
          onTimeFilter={setTimeFilter}
          onExport={handleExport}
        />

        <main className="dashboard-content">

          {activePage === 'Overview' && (
              <>
                <BusinessSummary filters={filters} />

                <div className="dashboard-grid single-column">
                  <KeyInsights filters={filters} />
                </div>

                <div className="dashboard-grid two-columns">
                  <AvgOrderValueByCuisine filters={filters} />
                  <AvgOrderValueByCity filters={filters} />
                </div>

                <div className="dashboard-grid two-columns">
                  <AvgOrderValueByMood filters={filters} />
                  <AvgRatingByRepeatOrder filters={filters} />
                </div>

                <div className="dashboard-grid two-columns">
                  <RepeatOrderFactors filters={filters} />
                  <ValueDrivers filters={filters} />
                </div>
              </>
            )}

          {activePage === 'Customers' && (
            <>
              <div className="dashboard-grid single-column">
                <DecisionTreeChart filters={filters} />
              </div>
              <div className="dashboard-grid single-column">
                <RepeatOrderPredictionForm />
              </div>
            </>
          )}

          {activePage === 'Ratings' && (
            <div className="dashboard-grid single-column">
              <HighRatingDrivers filters={filters} />
            </div>
          )}

          {activePage === 'Delivery' && (
            <>
              <div className="dashboard-grid single-column">
                <DeliveryTimeModel filters={filters} />
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