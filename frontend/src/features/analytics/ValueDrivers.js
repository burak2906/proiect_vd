import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const ValueDrivers = () => {
  const [metrics, setMetrics] = useState(null);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    api.get('/analytics/value-drivers')
      .then((res) => {
        setMetrics(res.data.metrics);

        const formatted = res.data.top_value_drivers.map((item) => ({
          factor: item.feature,
          score: Number((item.importance_mean * 100).toFixed(2))
        }));

        setDrivers(formatted);
      })
      .catch((err) => console.error('Eroare value drivers:', err));
  }, []);

  return (
    <SectionCard
      title="Order-value drivers"
      subtitle="Factorii care influențează cel mai mult valoarea comenzii"
    >
      {!metrics ? (
        <div className="loading-box">Se încarcă analiza de valoare...</div>
      ) : (
        <>
          <div className="tree-metrics">
            <div className="mini-metric">
              <span>MAE</span>
              <strong>{metrics.mae}</strong>
            </div>
            <div className="mini-metric">
              <span>RMSE</span>
              <strong>{metrics.rmse}</strong>
            </div>
            <div className="mini-metric">
              <span>R²</span>
              <strong>{metrics.r2}</strong>
            </div>
          </div>

          <div className="chart-wrap" style={{ marginTop: '18px' }}>
            <BarChart
              width={700}
              height={320}
              data={drivers}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="factor" type="category" width={180} />
              <Tooltip formatter={(value) => [`${value}%`, 'Importanță']} />
              <Bar dataKey="score" fill="#1d4ed8" radius={[0, 8, 8, 0]} />
            </BarChart>
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default ValueDrivers;