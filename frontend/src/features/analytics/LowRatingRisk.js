import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const LowRatingRisk = () => {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/analytics/low-rating-risk')
      .then((res) => {
        setMetrics(res.data.metrics);

        const formatted = res.data.top_risk_factors.map((item) => ({
          factor: item.feature,
          score: Number((item.importance_mean * 100).toFixed(2))
        }));

        setItems(formatted);
      })
      .catch((err) => console.error('Eroare low rating risk:', err));
  }, []);

  return (
    <SectionCard
      title="Low-rating risk"
      subtitle="Factorii care trebuie monitorizați pentru a reduce riscul unui rating mic"
    >
      {!metrics ? (
        <div className="loading-box">Se încarcă analiza riscului...</div>
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
            {items.map((item, index) => (
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
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default LowRatingRisk;