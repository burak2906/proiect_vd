import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import KpiCard from '../../components/KpiCard';
import SectionCard from '../../components/SectionCard';

const BusinessSummary = ({ filters = {} }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const params = {};
    if (filters.dayFilter)  params.day_type   = filters.dayFilter;
    if (filters.timeFilter) params.order_time = filters.timeFilter;

    api.get('/analytics/business-summary', { params })
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [filters.dayFilter, filters.timeFilter]);

  if (!data) {
    return (
      <SectionCard title="Business overview" subtitle="Se încarcă indicatorii principali">
        <div className="loading-box">Se încarcă indicatorii...</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Business overview"
      subtitle="Indicatori esențiali pentru performanța operațională"
    >
      <div className="kpi-grid">
        <KpiCard title="Total comenzi" value={data.total_orders} description="Volumul total al comenzilor analizate" />
        <KpiCard title="Total utilizatori" value={data.total_users} description="Utilizatori unici din platformă" />
        <KpiCard title="Valoare medie" value={data.average_order_value} description="Valoarea medie a unei comenzi" tone="accent" />
        <KpiCard title="Rating mediu" value={data.average_rating} description="Scorul mediu oferit de clienți" />
        <KpiCard title="Repeat rate" value={`${data.repeat_order_rate}%`} description="Procent comenzi repetate" tone="success" />
        <KpiCard title="Pondere comenzi pe ploaie" value={`${data.rainy_order_share}%`} description="Cât de multe comenzi apar pe vreme ploioasă" />
        <KpiCard title="Pondere weekend" value={`${data.weekend_order_share}%`} description="Procentul comenzilor plasate în weekend" />
      </div>
    </SectionCard>
  );
};

export default BusinessSummary;