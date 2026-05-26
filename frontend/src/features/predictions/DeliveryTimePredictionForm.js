import React, { useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const DeliveryTimePredictionForm = () => {
  const [is_rainy, setIsRainy] = useState(false);
  const [delivery_fee, setDeliveryFee] = useState(2.5);
  const [order_period, setOrderPeriod] = useState('Evening');
  const [day_type, setDayType] = useState('Weekday');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const payload = {
      rainy_weather: is_rainy ? 'Yes' : 'No',
      delivery_fee,
      order_time: order_period,
      day_type
    };

    api.post('/predictions/delivery-time', payload)
      .then((res) => {
        // backend should return { predicted_minutes: 23.4, interval: [20,26] }
        setResult(res.data);
      })
      .catch((err) => {
        console.error('Eroare la predictie delivery-time:', err);
        setResult({ error: 'Eroare server' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SectionCard title="Predict delivery time" subtitle="Estimare timp (minute) pentru o comandă dată">
      <form className="prediction-form" onSubmit={submit}>
        <div>
          <label>Ploaie</label>
          <select value={is_rainy ? 'Yes' : 'No'} onChange={(e) => setIsRainy(e.target.value === 'Yes')}>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div>
          <label>Taxă livrare</label>
          <input type="number" step="0.1" value={delivery_fee} onChange={(e) => setDeliveryFee(Number(e.target.value))} />
        </div>

        <div>
          <label>Interval orar</label>
          <select value={order_period} onChange={(e) => setOrderPeriod(e.target.value)}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
        </div>

        <div>
          <label>Zi</label>
          <select value={day_type} onChange={(e) => setDayType(e.target.value)}>
            <option>Weekday</option>
            <option>Weekend</option>
          </select>
        </div>

        <div>
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Se calculează...' : 'Calculează timp'}</button>
        </div>
      </form>

      {result && (
        <div className="prediction-result">
          {result.error ? (
            <p style={{ color: 'var(--danger)' }}>{result.error}</p>
          ) : (
            <>
              <h3>Rezultat</h3>
              <p>Timp estimat (minute): <strong>{Math.round(result.predicted_minutes)}</strong></p>
              {result.interval && <p>Interval: {Math.round(result.interval[0])} - {Math.round(result.interval[1])} minute</p>}
            </>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default DeliveryTimePredictionForm;