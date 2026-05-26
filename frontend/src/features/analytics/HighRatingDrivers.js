import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const HighRatingDrivers = ({ filters = {} }) => {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMetrics(null);
    setError('');

    const params = {};
    if (filters.dayFilter)  params.day_type   = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/high-rating-drivers', { params })
      .then((res) => {
        setMetrics(res.data?.metrics || null);

        const formatted = (res.data?.top_risk_factors || []).map((item) => ({
          factor: item.feature,
          score: Number(((item.importance_mean ?? 0) * 100).toFixed(2))
        }));

        setItems(formatted);
      })
      .catch((err) => {
        console.error('Eroare high rating drivers:', err);
        setError('Nu s-a putut încărca analiza.');
      });
  }, [filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard
      title="High-rating drivers"
      subtitle="Factorii asociați cu obținerea unui rating ridicat (>= 4)"
    >
      {error ? (
        <div className="loading-box">{error}</div>
      ) : !metrics ? (
        <div className="loading-box">Se încarcă analiza ratingurilor ridicate...</div>
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

          <div className="risk-list">
            {items.length === 0 ? (
              <div className="loading-box">Nu există factori disponibili.</div>
            ) : (
              items.map((item, index) => (
                <div key={item.factor} className="risk-row">
                  <div>
                    <span className="risk-rank">#{index + 1}</span>
                    <h3>{item.factor}</h3>
                  </div>

                  <div className="risk-bar-wrapper">
                    <div className="risk-bar">
                      <div
                        className="risk-bar-fill"
                        style={{ width: `${Math.max(item.score, 1)}%` }}
                      />
                    </div>
                    <span className="risk-score">{item.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default HighRatingDrivers;