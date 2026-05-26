import React from 'react';

const InsightCard = ({ title, text, type = 'info' }) => {
  return (
    <div className={`insight-card ${type}`}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
};

export default InsightCard;