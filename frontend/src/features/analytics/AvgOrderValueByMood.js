import React from 'react';
import SimpleBarChartCard from './SimpleBarChartCard';

const AvgOrderValueByMood = ({ filters = {} }) => {
  return (
    <SimpleBarChartCard
      title="Avg order value by mood"
      subtitle="Influența stării emoționale asupra valorii medii a comenzii"
      endpoint="/analytics/avg-order-value-by-mood"
      filters={filters}
      color="#d97706"
    />
  );
};

export default AvgOrderValueByMood;