import React from 'react';
import SimpleBarChartCard from './SimpleBarChartCard';

const AvgOrderValueByCity = ({ filters = {} }) => {
  return (
    <SimpleBarChartCard
      title="Avg order value by city"
      subtitle="Comparație între orașe după valoarea medie a comenzii"
      endpoint="/analytics/avg-order-value-by-city"
      filters={filters}
      color="#1d4ed8"
    />
  );
};

export default AvgOrderValueByCity;