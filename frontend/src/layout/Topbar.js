import React from 'react';

const Topbar = ({
  eyebrow,
  title,
  dayFilter,
  timeFilter,
  onDayFilter,
  onTimeFilter,
  onExport,
}) => {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <select
          className="filter-select"
          value={dayFilter}
          onChange={(e) => onDayFilter(e.target.value)}
        >
          <option value="">Toate perioadele</option>
          <option value="Weekday">Weekday</option>
          <option value="Weekend">Weekend</option>
        </select>

        <select
          className="filter-select"
          value={timeFilter}
          onChange={(e) => onTimeFilter(e.target.value)}
        >
          <option value="">Toate intervalele</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
          <option value="Night">Night</option>
        </select>

        <button className="primary-btn" onClick={onExport}>
          Export View
        </button>
      </div>
    </header>
  );
};

export default Topbar;