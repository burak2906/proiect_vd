import React from 'react';
import SimpleBarChartCard from './SimpleBarChartCard';

const AvgOrderValueByCuisine = ({ filters = {} }) => {
  return (
    <SimpleBarChartCard
      title="Avg order value by cuisine"
      subtitle="Valoarea medie a comenzii pentru fiecare tip de bucătărie"
      endpoint="/analytics/avg-order-value-by-cuisine"
      filters={filters}
      color="#0f766e"
    />
  );
};

export default AvgOrderValueByCuisine;