import React, { useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const RepeatOrderPredictionForm = () => {
  const [age, setAge] = useState(30);
  const [order_value, setOrderValue] = useState(20.0);
  const [mood, setMood] = useState('Neutral');
  const [order_time, setOrderTime] = useState('Evening');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      age,
      order_value,
      mood,
      order_time
    };

    api.post('/predictions/repeat-order', payload)
      .then((res) => {
        // backend should return { probability: 0.72, label: 'Likely' } or similar
        setResult(res.data);
      })
      .catch((err) => {
        console.error('Eroare la predictie repeat-order:', err);
        setResult({ error: 'Eroare server' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SectionCard title="Predict repeat order" subtitle="Simulează probabilitatea ca un user să revină">
      <form className="prediction-form" onSubmit={submit}>
        <div>
          <label>Vârsta</label>
          <input type="number" min="16" max="100" value={age} onChange={(e) => setAge(Number(e.target.value))} />
        </div>

        <div>
          <label>Valoare estimată comandă</label>
          <input type="number" step="0.5" value={order_value} onChange={(e) => setOrderValue(Number(e.target.value))} />
        </div>

        <div>
          <label>Stare (mood)</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option>Neutral</option>
            <option>Happy</option>
            <option>Stressed</option>
            <option>Celebrating</option>
            <option>Lazy</option>
          </select>
        </div>

        <div>
          <label>Interval orar</label>
          <select value={order_time} onChange={(e) => setOrderTime(e.target.value)}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
        </div>

        <div>
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Se calculează...' : 'Calculează probabilitate'}</button>
        </div>
      </form>

      {result && (
        <div className="prediction-result">
          {result.error ? (
            <p style={{ color: 'var(--danger)' }}>{result.error}</p>
          ) : (
            <>
              <h3>Rezultat</h3>
              <p>Probabilitate repeat order: <strong>{(result.probability * 100).toFixed(1)}%</strong></p>
              {result.label && <p>Clasificare: <strong>{result.label}</strong></p>}
            </>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default RepeatOrderPredictionForm;