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

const RepeatOrderFactors = ({ filters = {} }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params = {};
    if (filters.dayFilter)  params.day_type   = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/decision-tree-repeat-order', { params })
      .then((res) => {
        const formatted = (res.data.top_features || []).map((item) => ({
          factor: item.feature,
          importance: Number((item.importance * 100).toFixed(2))
        }));
        formatted.sort((a, b) => b.importance - a.importance);
        setChartData(formatted);
      })
      .catch((err) => {
        console.error('Eroare repeat order factors:', err);
      })
      .finally(() => setLoading(false));
  }, [filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard
      title="Repeat-order factors"
      subtitle="Cei mai importanți factori pentru comenzile recurente"
    >
      {loading ? (
        <div className="loading-box">Se încarcă analiza factorilor...</div>
      ) : chartData.length === 0 ? (
        <div className="loading-box">Nu sunt suficiente date pentru a arăta factorii</div>
      ) : (
        <div className="chart-wrap">
          <BarChart
            width={700}
            height={320}
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="factor" type="category" width={300} />
            <Tooltip formatter={(value) => [`${value}%`, 'Importanță']} />
            <Bar dataKey="importance" fill="#0f766e" radius={[0, 8, 8, 0]} />
          </BarChart>
        </div>
      )}
    </SectionCard>
  );
};

export default RepeatOrderFactors;