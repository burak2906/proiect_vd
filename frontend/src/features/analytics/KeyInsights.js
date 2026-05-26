import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const KeyInsights = ({ filters = {} }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params = {};
    if (filters.dayFilter) params.day_type = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/key-insights', { params })
      .then((res) => {
        setItems(res.data || []);
      })
      .catch((err) => {
        console.error('Eroare la încărcarea insight-urilor:', err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [filters.dayFilter, filters.timeFilter]);

  return (
    <SectionCard
      title="Key insights"
      subtitle="Concluzii de business extrase automat din datele analizate"
    >
      {loading ? (
        <div className="loading-box">Se încarcă insight-urile...</div>
      ) : items.length === 0 ? (
        <div className="loading-box">Nu există insight-uri disponibile pentru filtrele selectate.</div>
      ) : (
        <div className="insights-grid">
          {items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="insight-card">
              <span className="insight-label">{item.title}</span>
              <h3>{item.highlight}</h3>
              <p>{item.detail}</p>
              {item.value && <strong className="insight-value">{item.value}</strong>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default KeyInsights;