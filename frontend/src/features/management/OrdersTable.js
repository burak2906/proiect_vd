import React, { useEffect, useState, useCallback } from 'react';

const API = 'http://localhost:8000';

const EMPTY_ORDER = {
  user_id: '', age: '', city: '', order_time: 'Morning', day_type: 'Weekday',
  cuisine: 'Chinese', meal_type: 'Lunch', restaurant_type: 'Mid-range',
  order_value: '', discount_applied: 'No', delivery_fee: '',
  time_taken_to_order: '', rating_given: 3, is_repeat_order: 'No',
  mood: 'Happy', hunger_level: 'Medium', company: 'Alone', rainy_weather: 'No',
};

const CITIES        = ['Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Bangalore', 'Hyderabad'];
const ORDER_TIMES   = ['Morning', 'Afternoon', 'Evening', 'Night'];
const DAY_TYPES     = ['Weekday', 'Weekend'];
const CUISINES      = ['Chinese', 'South Indian', 'Biryani', 'Fast Food', 'North Indian', 'Desserts'];
const MEAL_TYPES    = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const REST_TYPES    = ['Budget', 'Mid-range', 'Premium'];
const MOODS         = ['Happy', 'Lazy', 'Stressed', 'Celebrating'];
const HUNGER_LEVELS = ['Low', 'Medium', 'High'];
const COMPANIES     = ['Alone', 'Partner', 'Friends', 'Family'];
const YES_NO        = ['Yes', 'No'];

export default function OrdersTable() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [page, setPage]         = useState(0);
  const [modal, setModal]       = useState(null); // null | { mode: 'add'|'edit', data }
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const PAGE_SIZE = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/orders/?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error('Eroare la încărcare');
      setOrders(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openAdd  = () => setModal({ mode: 'add',  data: { ...EMPTY_ORDER } });
  const openEdit = (o) => setModal({ mode: 'edit', data: { ...o } });
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleField = (k, v) =>
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    const { mode, data } = modal;
    const body = { ...data };
    delete body.order_id;

    // coerce numerics
    ['user_id','age','order_value','delivery_fee','time_taken_to_order','rating_given']
      .forEach(k => { body[k] = Number(body[k]); });

    try {
      const url    = mode === 'add' ? `${API}/orders/` : `${API}/orders/${data.order_id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Eroare la salvare');
      }
      closeModal();
      fetchOrders();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Eroare la ștergere');
      }
      setDeleteId(null);
      fetchOrders();
    } catch (e) {
      alert(e.message);
      setDeleteId(null);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Comenzi</h2>
          <p>Gestionează comenzile din baza de date</p>
        </div>
        <button className="primary-btn" onClick={openAdd}>+ Adaugă comandă</button>
      </div>

      <div className="section-card-body">
        {loading && <p className="loading-box">Se încarcă...</p>}
        {error   && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ background: 'var(--surface-3)' }}>
                    {['ID','User','Vârstă','Oraș','Timp','Zi','Bucătărie','Masă','Rest.',
                      'Valoare','Discount','Taxă liv.','Timp ord.','Rating','Repeat','Mood','Foame','Companie','Ploaie','Acțiuni']
                      .map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.order_id} style={{ background: i % 2 === 0 ? 'white' : 'var(--surface-2)' }}>
                      <td style={tdStyle}>{o.order_id}</td>
                      <td style={tdStyle}>{o.user_id}</td>
                      <td style={tdStyle}>{o.age}</td>
                      <td style={tdStyle}>{o.city}</td>
                      <td style={tdStyle}>{o.order_time}</td>
                      <td style={tdStyle}>{o.day_type}</td>
                      <td style={tdStyle}>{o.cuisine}</td>
                      <td style={tdStyle}>{o.meal_type}</td>
                      <td style={tdStyle}>{o.restaurant_type}</td>
                      <td style={tdStyle}>{o.order_value}</td>
                      <td style={tdStyle}>{o.discount_applied}</td>
                      <td style={tdStyle}>{o.delivery_fee}</td>
                      <td style={tdStyle}>{o.time_taken_to_order}</td>
                      <td style={tdStyle}>{o.rating_given}</td>
                      <td style={tdStyle}>{o.is_repeat_order}</td>
                      <td style={tdStyle}>{o.mood}</td>
                      <td style={tdStyle}>{o.hunger_level}</td>
                      <td style={tdStyle}>{o.company}</td>
                      <td style={tdStyle}>{o.rainy_weather}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <button onClick={() => openEdit(o)} style={editBtnStyle}>✏️ Edit</button>
                        <button onClick={() => setDeleteId(o.order_id)} style={deleteBtnStyle}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
              <button className="primary-btn" style={{ minHeight: 36, padding: '6px 14px', fontSize: '0.9rem' }}
                disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Pagina {page + 1}</span>
              <button className="primary-btn" style={{ minHeight: 36, padding: '6px 14px', fontSize: '0.9rem' }}
                disabled={orders.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <Overlay onClose={closeModal}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 18px' }}>
              {modal.mode === 'add' ? 'Adaugă comandă nouă' : `Editează comanda #${modal.data.order_id}`}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="User ID">
                <input className="filter-select" type="number" value={modal.data.user_id}
                  onChange={e => handleField('user_id', e.target.value)} />
              </Field>
              <Field label="Vârstă">
                <input className="filter-select" type="number" min={18} max={100} value={modal.data.age}
                  onChange={e => handleField('age', e.target.value)} />
              </Field>
              <Field label="Oraș">
                <Select value={modal.data.city} opts={CITIES} onChange={v => handleField('city', v)} />
              </Field>
              <Field label="Timp comandă">
                <Select value={modal.data.order_time} opts={ORDER_TIMES} onChange={v => handleField('order_time', v)} />
              </Field>
              <Field label="Tip zi">
                <Select value={modal.data.day_type} opts={DAY_TYPES} onChange={v => handleField('day_type', v)} />
              </Field>
              <Field label="Bucătărie">
                <Select value={modal.data.cuisine} opts={CUISINES} onChange={v => handleField('cuisine', v)} />
              </Field>
              <Field label="Masă">
                <Select value={modal.data.meal_type} opts={MEAL_TYPES} onChange={v => handleField('meal_type', v)} />
              </Field>
              <Field label="Tip restaurant">
                <Select value={modal.data.restaurant_type} opts={REST_TYPES} onChange={v => handleField('restaurant_type', v)} />
              </Field>
              <Field label="Valoare comandă (₹)">
                <input className="filter-select" type="number" min={100} max={999} value={modal.data.order_value}
                  onChange={e => handleField('order_value', e.target.value)} />
              </Field>
              <Field label="Discount aplicat">
                <Select value={modal.data.discount_applied} opts={YES_NO} onChange={v => handleField('discount_applied', v)} />
              </Field>
              <Field label="Taxă livrare (₹)">
                <input className="filter-select" type="number" min={20} max={99} value={modal.data.delivery_fee}
                  onChange={e => handleField('delivery_fee', e.target.value)} />
              </Field>
              <Field label="Timp procesare (min)">
                <input className="filter-select" type="number" min={1} max={14} value={modal.data.time_taken_to_order}
                  onChange={e => handleField('time_taken_to_order', e.target.value)} />
              </Field>
              <Field label="Rating (1-5)">
                <input className="filter-select" type="number" min={1} max={5} value={modal.data.rating_given}
                  onChange={e => handleField('rating_given', e.target.value)} />
              </Field>
              <Field label="Comandă repetată">
                <Select value={modal.data.is_repeat_order} opts={YES_NO} onChange={v => handleField('is_repeat_order', v)} />
              </Field>
              <Field label="Mood">
                <Select value={modal.data.mood} opts={MOODS} onChange={v => handleField('mood', v)} />
              </Field>
              <Field label="Nivel foame">
                <Select value={modal.data.hunger_level} opts={HUNGER_LEVELS} onChange={v => handleField('hunger_level', v)} />
              </Field>
              <Field label="Companie">
                <Select value={modal.data.company} opts={COMPANIES} onChange={v => handleField('company', v)} />
              </Field>
              <Field label="Vreme ploioasă">
                <Select value={modal.data.rainy_weather} opts={YES_NO} onChange={v => handleField('rainy_weather', v)} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={cancelBtnStyle}>Anulează</button>
              <button className="primary-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Se salvează...' : 'Salvează'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Overlay onClose={() => setDeleteId(null)}>
          <div style={{ ...modalStyle, maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px' }}>Confirmare ștergere</h3>
            <p style={{ color: 'var(--muted)', margin: '0 0 22px' }}>
              Ești sigur că vrei să ștergi comanda <strong>#{deleteId}</strong>? Acțiunea este ireversibilă.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} style={cancelBtnStyle}>Anulează</button>
              <button onClick={() => handleDelete(deleteId)} style={{ ...deleteBtnStyle, padding: '10px 18px', borderRadius: 10 }}>
                🗑 Șterge
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
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

// ── Styles ───────────────────────────────────────────────────────────────

const tableStyle = {
  width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem',
  borderRadius: 12, overflow: 'hidden',
};
const thStyle = {
  padding: '10px 12px', textAlign: 'left', fontWeight: 600,
  color: 'var(--muted)', fontSize: '0.8rem', whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
};
const tdStyle = {
  padding: '9px 12px', borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap', color: 'var(--text)',
};
const editBtnStyle = {
  background: 'rgba(15,118,110,0.1)', color: 'var(--primary)', border: 'none',
  borderRadius: 8, padding: '5px 10px', cursor: 'pointer', marginRight: 6,
  fontSize: '0.82rem', fontWeight: 600,
};
const deleteBtnStyle = {
  background: 'rgba(185,28,28,0.1)', color: 'var(--danger)', border: 'none',
  borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
  fontSize: '0.82rem', fontWeight: 600,
};
const cancelBtnStyle = {
  background: 'var(--surface-3)', color: 'var(--text)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 500,
};
const modalStyle = {
  background: 'white', borderRadius: 20, padding: 28,
  boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
  maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto',
};