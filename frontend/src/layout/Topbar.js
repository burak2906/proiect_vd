import React from 'react';

const Topbar = () => {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Executive analytics</p>
        <h1>Food Delivery Manager Dashboard</h1>
      </div>

      <div className="topbar-actions">
        <select className="filter-select">
          <option>Toate perioadele</option>
          <option>Weekday</option>
          <option>Weekend</option>
        </select>

        <select className="filter-select">
          <option>Toate intervalele</option>
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Evening</option>
          <option>Night</option>
        </select>

        <button className="primary-btn">Export View</button>
      </div>
    </header>
  );
};

export default Topbar;