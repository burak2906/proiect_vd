import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import api from '../../services/api';

const DecisionTreeChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/decision-tree-repeat-order')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare decision tree:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă modelul Decision Tree...</div>;

  const features = data.top_features || [];

  return (
    <div className="dashboard-card">
      <h2>Decision Tree pentru repeat order</h2>
      <p className="subtitle">Care sunt regulile care explică fidelizarea clientului</p>

      <Plot
        data={[
          {
            x: features.map(item => item.importance),
            y: features.map(item => item.feature),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#2563eb' }
          }
        ]}
        layout={{
          autosize: true,
          height: 400,
          margin: { l: 220, r: 20, t: 20, b: 50 },
          xaxis: { title: 'Importanță' },
          yaxis: { automargin: true }
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />

      <div className="kpi-grid" style={{ marginTop: '20px' }}>
        <div className="kpi-item"><span className="label">Accuracy</span><span className="value">{data.metrics.accuracy}</span></div>
        <div className="kpi-item"><span className="label">Precision</span><span className="value">{data.metrics.precision}</span></div>
        <div className="kpi-item"><span className="label">Recall</span><span className="value">{data.metrics.recall}</span></div>
        <div className="kpi-item"><span className="label">F1 Score</span><span className="value">{data.metrics.f1_score}</span></div>
      </div>

      <h3 style={{ textAlign: 'left', marginTop: '24px' }}>Reguli extrase</h3>
      <pre className="tree-box">{data.tree_rules}</pre>
    </div>
  );
};

export default DecisionTreeChart;