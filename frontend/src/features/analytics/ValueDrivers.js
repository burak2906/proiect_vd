import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const ValueDrivers = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/value-drivers')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare value drivers:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă analiza valorii comenzii...</div>;

  const drivers = data.top_value_drivers || [];

  return (
    <div className="dashboard-card">
      <h2>Ce influențează valoarea comenzii</h2>
      <p className="subtitle">Random Forest pentru order value</p>

      <Plot
        data={[
          {
            x: drivers.map(item => item.importance_mean),
            y: drivers.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#ec4899' }
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
    </div>
  );
};

export default ValueDrivers;