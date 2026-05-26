import React from 'react';

const KpiCard = ({ title, value, description, tone = 'default' }) => {
  return (
    <div className={`kpi-card tone-${tone}`}>
      <span className="kpi-title">{title}</span>
      <h3 className="kpi-value">{value}</h3>
      <p className="kpi-description">{description}</p>
    </div>
  );
};

export default KpiCard;