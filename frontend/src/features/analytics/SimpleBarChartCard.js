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
  ResponsiveContainer
} from 'recharts';

const SimpleBarChartCard = ({ title, subtitle, endpoint, filters = {}, color = '#0f766e' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params = {};
    if (filters.dayFilter) params.day_type = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get(endpoint, { params })
      .then((res) => {
        setItems(res.data || []);
      })
      .catch((err) => {
        console.error(`Eroare la ${endpoint}:`, err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [endpoint, filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {loading ? (
        <div className="loading-box">Se încarcă graficul...</div>
      ) : items.length === 0 ? (
        <div className="loading-box">Nu există date pentru filtrele selectate.</div>
      ) : (
        <div className="chart-wrap" style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                angle={-20}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Value']} />
              <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
};

export default SimpleBarChartCard;