import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const RepeatOrderFactors = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/repeat-order-probability')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare logistic regression:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă factorii repeat order...</div>;

  const positive = data.factors_increasing_repeat_probability || [];
  const negative = data.factors_decreasing_repeat_probability || [];

  return (
    <div className="dashboard-card">
      <h2>Factori care influențează repeat order</h2>
      <p className="subtitle">Interpretare Logistic Regression prin odds ratio</p>

      <Plot
        data={[
          {
            x: positive.map(item => item.odds_ratio),
            y: positive.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            name: 'Cresc probabilitatea',
            marker: { color: '#16a34a' }
          },
          {
            x: negative.map(item => item.odds_ratio),
            y: negative.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            name: 'Scad probabilitatea',
            marker: { color: '#dc2626' }
          }
        ]}
        layout={{
          barmode: 'group',
          autosize: true,
          height: 500,
          margin: { l: 240, r: 20, t: 20, b: 50 },
          xaxis: { title: 'Odds Ratio' },
          yaxis: { automargin: true }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default RepeatOrderFactors;