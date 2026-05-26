import React from 'react';
import SimpleBarChartCard from './SimpleBarChartCard';

const AvgRatingByRepeatOrder = ({ filters = {} }) => {
  return (
    <SimpleBarChartCard
      title="Avg rating by repeat order"
      subtitle="Comparație între ratingul mediu pentru comenzi repeat vs non-repeat"
      endpoint="/analytics/avg-rating-by-repeat-order"
      filters={filters}
      color="#7c3aed"
    />
  );
};

export default AvgRatingByRepeatOrder;