import React, { useState } from 'react';
import api from '../../services/api';
import SectionCard from '../../components/SectionCard';

const DeliveryTimePredictionForm = () => {
  const [form, setForm] = useState({
    age: 30,
    order_value: 20.0,
    delivery_fee: 2.5,
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
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    api.post('/predict/delivery-time', form)
      .then((res) => setResult(res.data))
      .catch((err) => {
        console.error('Eroare predicție delivery time:', err);
        setResult({ error: 'Eroare server' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SectionCard
      title="Predict delivery time"
      subtitle="Estimare timp de procesare a comenzii (minute)"
    >
      <form className="prediction-form" onSubmit={submit}>

        {/* ── Numerice ── */}
        <div>
          <label>Vârstă</label>
          <input type="number" name="age" min="10" max="100"
            value={form.age} onChange={handleChange} />
        </div>
        <div>
          <label>Valoare comandă</label>
          <input type="number" step="0.5" name="order_value"
            value={form.order_value} onChange={handleChange} />
        </div>
        <div>
          <label>Taxă livrare</label>
          <input type="number" step="0.1" name="delivery_fee"
            value={form.delivery_fee} onChange={handleChange} />
        </div>

        {/* ── Categorice ── */}
        <div>
          <label>Interval orar</label>
          <select name="order_time" value={form.order_time} onChange={handleChange}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Evening</option>
            <option>Night</option>
          </select>
        </div>

        <div>
          <label>Tip zi</label>
          <select name="day_type" value={form.day_type} onChange={handleChange}>
            <option>Weekday</option>
            <option>Weekend</option>
          </select>
        </div>

        <div>
          <label>Discount aplicat</label>
          <select name="discount_applied" value={form.discount_applied} onChange={handleChange}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>

        <div>
          <label>Tip restaurant</label>
          <select name="restaurant_type" value={form.restaurant_type} onChange={handleChange}>
            <option>Budget</option>
            <option>Mid-range</option>
            <option>Premium</option>
          </select>
        </div>

        <div>
          <label>Stare (mood)</label>
          <select name="mood" value={form.mood} onChange={handleChange}>
            <option>Happy</option>
            <option>Stressed</option>
            <option>Celebrating</option>
            <option>Lazy</option>
          </select>
        </div>

        <div>
          <label>Nivel foame</label>
          <select name="hunger_level" value={form.hunger_level} onChange={handleChange}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label>Companie</label>
          <select name="company" value={form.company} onChange={handleChange}>
            <option>Alone</option>
            <option>Friends</option>
            <option>Family</option>
            <option>Partner</option>
          </select>
        </div>

        <div>
          <label>Vreme ploioasă</label>
          <select name="rainy_weather" value={form.rainy_weather} onChange={handleChange}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>

        <div>
          <label>Bucătărie</label>
          <select name="cuisine" value={form.cuisine} onChange={handleChange}>
            <option>North Indian</option>
            <option>South Indian</option>
            <option>Chinese</option>
            <option>Biryani</option>
            <option>Fast Food</option>
            <option>Desserts</option>
          </select>
        </div>

        <div>
          <label>Tip masă</label>
          <select name="meal_type" value={form.meal_type} onChange={handleChange}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snacks</option>
          </select>
        </div>

        <div>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Se calculează...' : 'Calculează timp'}
          </button>
        </div>

      </form>

      {result && (
        <div className="prediction-result">
          {result.error ? (
            <p style={{ color: 'var(--danger)' }}>{result.error}</p>
          ) : (
            <>
              <h3>Rezultat</h3>
              <p>
                Timp estimat de procesare:{' '}
                <strong>{result.predicted_time_taken_to_order} minute</strong>
              </p>
            </>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default DeliveryTimePredictionForm;