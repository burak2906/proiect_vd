import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const BusinessSummary = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/business-summary')
      .then(res => setData(res.data))
      .catch(err => console.error('Eroare business summary:', err));
  }, []);

  if (!data) return <div className="loading">Se încarcă indicatorii principali...</div>;

  return (
    <div className="dashboard-card">
      <h2>Indicatori principali</h2>
      <p className="subtitle">Rezumat general al comenzilor și utilizatorilor</p>

      <div className="kpi-grid">
        <div className="kpi-item">
          <span className="label">Total comenzi</span>
          <span className="value">{data.total_orders}</span>
        </div>
        <div className="kpi-item">
          <span className="label">Total utilizatori</span>
          <span className="value">{data.total_users}</span>
        </div>
        <div className="kpi-item">
          <span className="label">Valoare medie comandă</span>
          <span className="value">{data.average_order_value}</span>
        </div>
        <div className="kpi-item">
          <span className="label">Rating mediu</span>
          <span className="value">{data.average_rating}</span>
        </div>
        <div className="kpi-item">
          <span className="label">Rata repeat order</span>
          <span className="value">{data.repeat_order_rate}%</span>
        </div>
        <div className="kpi-item">
          <span className="label">Pondere comenzi pe ploaie</span>
          <span className="value">{data.rainy_order_share}%</span>
        </div>
      </div>
    </div>
  );
};

export default BusinessSummary;