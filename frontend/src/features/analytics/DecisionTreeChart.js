import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const DecisionTreeChart = ({ filters = {} }) => {
  const [tree, setTree] = useState('');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    setMetrics(null);

    const params = {};
    if (filters.dayFilter)  params.day_type   = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/decision-tree-repeat-order', { params })
      .then((res) => {
        setTree(res.data.tree_rules);
        setMetrics(res.data.metrics);
      })
      .catch((err) => console.error('Eroare arbore:', err));
  }, [filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard
      title="Repeat-order logic"
      subtitle="Arbore de decizie pentru înțelegerea comenzilor recurente"
    >
      {!metrics ? (
        <div className="loading-box">Se generează arborele de decizie...</div>
      ) : (
        <>
          <div className="tree-metrics">
            <div className="mini-metric">
              <span>Accuracy</span>
              <strong>{metrics.accuracy}</strong>
            </div>
            <div className="mini-metric">
              <span>Precision</span>
              <strong>{metrics.precision}</strong>
            </div>
            <div className="mini-metric">
              <span>Recall</span>
              <strong>{metrics.recall}</strong>
            </div>
            <div className="mini-metric">
              <span>F1 Score</span>
              <strong>{metrics.f1_score}</strong>
            </div>
          </div>

          <pre className="tree-box">{tree}</pre>
        </>
      )}
    </SectionCard>
  );
};

export default DecisionTreeChart;