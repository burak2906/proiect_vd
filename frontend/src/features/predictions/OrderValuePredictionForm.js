import React, { useState } from 'react';

const API = 'http://localhost:8000';

const ORDER_TIMES   = ['Morning', 'Afternoon', 'Evening', 'Night'];
const DAY_TYPES     = ['Weekday', 'Weekend'];
const REST_TYPES    = ['Budget', 'Mid-range', 'Premium'];
const MOODS         = ['Happy', 'Lazy', 'Stressed', 'Celebrating'];
const HUNGER_LEVELS = ['Low', 'Medium', 'High'];
const COMPANIES     = ['Alone', 'Partner', 'Friends', 'Family'];
const YES_NO        = ['Yes', 'No'];
const CUISINES      = ['Chinese', 'South Indian', 'Biryani', 'Fast Food', 'North Indian', 'Desserts'];
const MEAL_TYPES    = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const INITIAL = {
  age: 28,
  delivery_fee: 50,
  time_taken_to_order: 7,
  order_time: 'Evening',
  day_type: 'Weekday',
  discount_applied: 'No',
  restaurant_type: 'Mid-range',
  mood: 'Happy',
  hunger_level: 'Medium',
  company: 'Alone',
  rainy_weather: 'No',
  cuisine: 'North Indian',
  meal_type: 'Dinner',
};

export default function OrderValuePredictionForm() {
  const [form, setForm]     = useState({ ...INITIAL });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        ...form,
        age: Number(form.age),
        delivery_fee: Number(form.delivery_fee),
        time_taken_to_order: Number(form.time_taken_to_order),
      };
      const res = await fetch(`${API}/predict/order-value`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Eroare la predicție');
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header">
        <h2>Predict order value</h2>
        <p>Estimează valoarea unei comenzi pe baza contextului</p>
      </div>

      <div className="section-card-body">
        <div className="prediction-form">

          {/* Rând 1 — numerice */}
          <div style={rowStyle}>
            <Field label="Vârstă client">
              <input
                className="filter-select" type="number" min={18} max={44}
                value={form.age} onChange={e => set('age', e.target.value)}
              />
            </Field>
            <Field label="Taxă livrare (₹)">
              <input
                className="filter-select" type="number" min={20} max={99}
                value={form.delivery_fee} onChange={e => set('delivery_fee', e.target.value)}
              />
            </Field>
            <Field label="Timp procesare (min)">
              <input
                className="filter-select" type="number" min={1} max={14}
                value={form.time_taken_to_order} onChange={e => set('time_taken_to_order', e.target.value)}
              />
            </Field>
          </div>

          {/* Rând 2 — context comandă */}
          <div style={rowStyle}>
            <Field label="Interval orar">
              <Select value={form.order_time} opts={ORDER_TIMES} onChange={v => set('order_time', v)} />
            </Field>
            <Field label="Tip zi">
              <Select value={form.day_type} opts={DAY_TYPES} onChange={v => set('day_type', v)} />
            </Field>
            <Field label="Discount aplicat">
              <Select value={form.discount_applied} opts={YES_NO} onChange={v => set('discount_applied', v)} />
            </Field>
            <Field label="Tip restaurant">
              <Select value={form.restaurant_type} opts={REST_TYPES} onChange={v => set('restaurant_type', v)} />
            </Field>
          </div>

          {/* Rând 3 — context client */}
          <div style={rowStyle}>
            <Field label="Stare (mood)">
              <Select value={form.mood} opts={MOODS} onChange={v => set('mood', v)} />
            </Field>
            <Field label="Nivel foame">
              <Select value={form.hunger_level} opts={HUNGER_LEVELS} onChange={v => set('hunger_level', v)} />
            </Field>
            <Field label="Companie">
              <Select value={form.company} opts={COMPANIES} onChange={v => set('company', v)} />
            </Field>
            <Field label="Vreme ploioasă">
              <Select value={form.rainy_weather} opts={YES_NO} onChange={v => set('rainy_weather', v)} />
            </Field>
          </div>

          {/* Rând 4 — mâncare */}
          <div style={rowStyle}>
            <Field label="Bucătărie">
              <Select value={form.cuisine} opts={CUISINES} onChange={v => set('cuisine', v)} />
            </Field>
            <Field label="Tip masă">
              <Select value={form.meal_type} opts={MEAL_TYPES} onChange={v => set('meal_type', v)} />
            </Field>
          </div>

          <button className="primary-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Se calculează...' : 'Estimează valoarea comenzii'}
          </button>
        </div>

        {/* Eroare */}
        {error && (
          <p style={{ color: 'var(--danger)', marginTop: 12, fontSize: '0.9rem' }}>⚠️ {error}</p>
        )}

        {/* Rezultat */}
        {result && (
          <div style={{ marginTop: 20 }}>
            {/* Valoare principală */}
            <div style={{
              background: 'rgba(15,118,110,0.07)',
              border: '1px solid rgba(15,118,110,0.18)',
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 24,
              flexWrap: 'wrap',
            }}>
              <div>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>
                  Valoare estimată
                </span>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{result.predicted_order_value}
                </span>
              </div>

              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>
                  Interval probabil
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={rangeBadgeStyle('#15803d')}>₹{result.range_low}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>—</span>
                  <span style={rangeBadgeStyle('#b45309')}>₹{result.range_high}</span>
                </div>
              </div>
            </div>

            {/* Context explicativ */}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <ContextTag label="Restaurant" value={form.restaurant_type} />
              <ContextTag label="Mood" value={form.mood} />
              <ContextTag label="Companie" value={form.company} />
              <ContextTag label="Foame" value={form.hunger_level} />
              {form.discount_applied === 'Yes' && <ContextTag label="Discount" value="aplicat ✓" accent />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 140 }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  );
}

function Select({ value, opts, onChange }) {
  return (
    <select className="filter-select" value={value} onChange={e => onChange(e.target.value)}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function ContextTag({ label, value, accent }) {
  return (
    <span style={{
      background: accent ? 'rgba(15,118,110,0.1)' : 'var(--surface-3)',
      border: `1px solid ${accent ? 'rgba(15,118,110,0.2)' : 'var(--border)'}`,
      borderRadius: 999, padding: '4px 12px',
      fontSize: '0.82rem', color: accent ? 'var(--primary)' : 'var(--muted)',
      fontWeight: 500,
    }}>
      {label}: <strong style={{ color: accent ? 'var(--primary)' : 'var(--text)' }}>{value}</strong>
    </span>
  );
}

function rangeBadgeStyle(color) {
  return {
    background: `${color}18`,
    border: `1px solid ${color}33`,
    borderRadius: 8, padding: '4px 12px',
    fontSize: '1rem', fontWeight: 700, color,
  };
}

const rowStyle = {
  display: 'flex', gap: 12, flexWrap: 'wrap',
};