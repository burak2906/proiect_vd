import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter
} from 'recharts';

const DeliveryTimeModel = ({ filters = {} }) => {
  const [metrics, setMetrics] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [sample, setSample] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setMetrics(null);

    const params = {};
    if (filters.dayFilter)  params.day_type   = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/delivery-time-model', { params })
      .then((res) => {
        setMetrics(res.data.metrics || null);

        const formattedDrivers = (res.data.top_time_drivers || []).map((item) => ({
          factor: item.feature,
          impact: Number((item.importance_mean * 100).toFixed(2))
        }));

        setDrivers(formattedDrivers);
        setSample(res.data.actual_vs_predicted_sample || []);
      })
      .catch((err) => console.error('Eroare delivery model:', err))
      .finally(() => setLoading(false));
  }, [filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard
      title="Delivery-time model"
      subtitle="Model pentru estimarea timpului de procesare a comenzii"
    >
      {loading ? (
        <div className="loading-box">Se încarcă modelul de timp...</div>
      ) : !metrics ? (
        <div className="loading-box">Nu sunt disponibile metricile modelului</div>
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

          <div className="chart-wrap">
            <BarChart
              width={700}
              height={320}
              data={drivers}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="factor" type="category" width={180} />
              <Tooltip formatter={(value) => [`${value}%`, 'Impact']} />
              <Bar dataKey="impact" fill="#0f766e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </div>

          <div className="chart-wrap" style={{ marginTop: '18px' }}>
            <ScatterChart
              width={700}
              height={280}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="actual" name="Actual" />
              <YAxis type="number" dataKey="predicted" name="Predicted" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={sample} fill="#1d4ed8" />
            </ScatterChart>
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default DeliveryTimeModel;