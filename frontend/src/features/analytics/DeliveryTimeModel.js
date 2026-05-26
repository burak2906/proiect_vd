import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const DeliveryTimeModel = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/delivery-time-model')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare delivery time model:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă modelul de timp...</div>;

  const sample = data.actual_vs_predicted_sample || [];
  const drivers = data.top_time_drivers || [];

  return (
    <div className="dashboard-card">
      <h2>Model pentru timpul comenzii</h2>
      <p className="subtitle">Predicție și factori principali ai duratei</p>

      <Plot
        data={[
          {
            x: sample.map(item => item.actual),
            y: sample.map(item => item.predicted),
            mode: 'markers',
            type: 'scatter',
            marker: { color: '#0ea5e9', size: 9 }
          }
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { l: 60, r: 20, t: 20, b: 60 },
          xaxis: { title: 'Timp real' },
          yaxis: { title: 'Timp prezis' }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />

      <Plot
        data={[
          {
            x: drivers.map(item => item.importance_mean),
            y: drivers.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#f59e0b' }
          }
        ]}
        layout={{
          autosize: true,
          height: 450,
          margin: { l: 240, r: 20, t: 20, b: 50 },
          xaxis: { title: 'Importanță' },
          yaxis: { automargin: true }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default DeliveryTimeModel;