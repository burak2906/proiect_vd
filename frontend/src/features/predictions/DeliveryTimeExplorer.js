import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

const API = 'http://localhost:8000';

const VARY_OPTIONS = [
  { key: 'rainy_weather',    label: 'Vreme ploioasă',   values: ['Yes', 'No'] },
  { key: 'order_time',       label: 'Interval orar',    values: ['Morning', 'Afternoon', 'Evening', 'Night'] },
  { key: 'restaurant_type',  label: 'Tip restaurant',   values: ['Budget', 'Mid-range', 'Premium'] },
  { key: 'hunger_level',     label: 'Nivel foame',      values: ['Low', 'Medium', 'High'] },
  { key: 'day_type',         label: 'Tip zi',           values: ['Weekday', 'Weekend'] },
  { key: 'mood',             label: 'Mood',             values: ['Happy', 'Lazy', 'Stressed', 'Celebrating'] },
  { key: 'company',          label: 'Companie',         values: ['Alone', 'Partner', 'Friends', 'Family'] },
  { key: 'discount_applied', label: 'Discount aplicat', values: ['Yes', 'No'] },
  { key: 'cuisine',          label: 'Bucătărie',        values: ['Chinese', 'South Indian', 'Biryani', 'Fast Food', 'North Indian', 'Desserts'] },
  { key: 'meal_type',        label: 'Tip masă',         values: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] },
];

const COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#0f766e', '#0d9488', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', color: 'white',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', color: '#60a5fa' }}>
        {payload[0].value.toFixed(1)} minute
      </div>
    </div>
  );
};

export default function DeliveryTimeExplorer({ formValues }) {
  const [varyKey, setVaryKey]     = useState('rainy_weather');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(false);
  const debounceRef = useRef(null);

  const currentVary = VARY_OPTIONS.find(o => o.key === varyKey);

  const fetchAll = useCallback(async () => {
    if (!formValues || !currentVary) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        currentVary.values.map(async (val) => {
          const body = {
            ...formValues,
            [varyKey]: val,
            age: Number(formValues.age),
            order_value: Number(formValues.order_value),
            delivery_fee: Number(formValues.delivery_fee),
          };
          const res = await fetch(`${API}/predict/delivery-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          return { name: val, value: data.predicted_time_taken_to_order };
        })
      );
      setChartData(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [formValues, varyKey, currentVary]);

  useEffect(() => {
    if (!formValues) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAll(), 300);
    return () => clearTimeout(debounceRef.current);
  }, [formValues, varyKey, fetchAll]);

  const currentPrediction = chartData.find(d => d.name === formValues?.[varyKey]);

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Live Explorer</div>
          <h3 style={titleStyle}>Timp estimat de procesare</h3>
          <p style={subtitleStyle}>Variază un parametru și vezi impactul în timp real</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {loading && <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>● live</span>}
          <div style={selectorWrapStyle}>
            <span style={selectorLabelStyle}>Variază după</span>
            <select
              style={selectStyle}
              value={varyKey}
              onChange={e => setVaryKey(e.target.value)}
            >
              {VARY_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentPrediction && (
        <div style={currentBadgeStyle}>
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Selecția ta ({formValues[varyKey]})</span>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1d4ed8' }}>
            {currentPrediction.value.toFixed(1)} min
          </span>
        </div>
      )}

      {formValues && (
        <div style={{
          display: 'flex', gap: 16, marginBottom: 12,
          padding: '8px 12px', background: 'var(--surface-3)',
          borderRadius: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Context fix: <strong style={{ color: '#0f172a' }}>Vârstă {formValues.age}</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>Valoare comandă ₹{formValues.order_value}</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>Taxă ₹{formValues.delivery_fee}</strong>
          </span>
        </div>
      )}

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 14]}
              ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
              tickFormatter={v => `${v}m`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(29,78,216,0.05)' }} />
            {currentPrediction && (
              <ReferenceLine
                y={currentPrediction.value}
                stroke="#1d4ed8"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
            )}
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.name === formValues?.[varyKey] ? '#1d4ed8' : COLORS[i % COLORS.length]}
                  opacity={entry.name === formValues?.[varyKey] ? 1 : 0.55}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          Completează formularul pentru a vedea predicțiile
        </div>
      )}

      <div style={legendStyle}>
        <span style={{ width: 12, height: 12, borderRadius: 3, background: '#1d4ed8', display: 'inline-block' }} />
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Valoarea ta selectată în formular</span>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'white', borderRadius: 18, padding: '22px 22px 16px',
  border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
};
const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  marginBottom: 16, flexWrap: 'wrap', gap: 12,
};
const eyebrowStyle = {
  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#1d4ed8', marginBottom: 4,
};
const titleStyle = { margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 };
const subtitleStyle = { margin: 0, color: '#64748b', fontSize: '0.85rem' };
const selectorWrapStyle = { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' };
const selectorLabelStyle = { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 };
const selectStyle = {
  border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px',
  fontSize: '0.85rem', color: '#0f172a', background: '#f8fafc',
  cursor: 'pointer', outline: 'none',
};
const currentBadgeStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.14)',
  borderRadius: 10, padding: '8px 14px', marginBottom: 14,
};
const legendStyle = {
  display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
};