import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const LowRatingRisk = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/low-rating-risk')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare low rating risk:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă analiza riscului de rating mic...</div>;

  const factors = data.top_risk_factors || [];
  const cm = data.confusion_matrix?.matrix || [[0, 0], [0, 0]];

  return (
    <div className="dashboard-card">
      <h2>Factori de risc pentru rating mic</h2>
      <p className="subtitle">Random Forest + permutation importance</p>

      <Plot
        data={[
          {
            x: factors.map(item => item.importance_mean),
            y: factors.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#7c3aed' },
            error_x: {
              type: 'data',
              array: factors.map(item => item.importance_std),
              visible: true
            }
          }
        ]}
        layout={{
          autosize: true,
          height: 450,
          margin: { l: 240, r: 20, t: 20, b: 50 },
          xaxis: { title: 'Permutation Importance' },
          yaxis: { automargin: true }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />

      <h3 style={{ textAlign: 'left', marginTop: '24px' }}>Confusion Matrix</h3>
      <Plot
        data={[
          {
            z: cm,
            x: data.confusion_matrix.labels,
            y: data.confusion_matrix.labels,
            type: 'heatmap',
            colorscale: 'Blues',
            showscale: true
          }
        ]}
        layout={{
          autosize: true,
          height: 350,
          margin: { l: 100, r: 20, t: 20, b: 80 }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default LowRatingRisk;