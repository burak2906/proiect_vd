import React from 'react';

const SectionCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <section className={`section-card ${className}`}>
      <div className="section-card-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="section-card-body">{children}</div>
    </section>
  );
};

export default SectionCard;