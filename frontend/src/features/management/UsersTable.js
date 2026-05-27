import React, { useEffect, useState, useCallback } from 'react';

const API = 'http://localhost:8000';

const EMPTY_USER = { full_name: '', email: '', city: '' };
const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Chandigarh', 'Bangalore', 'Hyderabad'];

export default function UsersTable() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [modal, setModal]       = useState(null); // null | { mode: 'add'|'edit', data }
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteErr, setDeleteErr] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/users/`);
      if (!res.ok) throw new Error('Eroare la încărcare');
      setUsers(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openAdd  = () => setModal({ mode: 'add',  data: { ...EMPTY_USER } });
  const openEdit = (u) => setModal({ mode: 'edit', data: { ...u } });
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleField = (k, v) =>
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  const handleSave = async () => {
    const { full_name, email, city } = modal.data;
    if (!full_name.trim() || !email.trim() || !city) {
      alert('Completează toate câmpurile.');
      return;
    }
    setSaving(true);
    const body = { full_name, email, city };

    try {
      const url    = modal.mode === 'add' ? `${API}/users/` : `${API}/users/${modal.data.id}`;
      const method = modal.mode === 'add' ? 'POST' : 'PUT';
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
      fetchUsers();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteErr(null);
    try {
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Eroare la ștergere');
      }
      setDeleteId(null);
      fetchUsers();
    } catch (e) {
      setDeleteErr(e.message);
    }
  };

  return (
    <div className="section-card">
      <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Utilizatori</h2>
          <p>Gestionează utilizatorii înregistrați</p>
        </div>
        <button className="primary-btn" onClick={openAdd}>+ Adaugă utilizator</button>
      </div>

      <div className="section-card-body">
        {loading && <p className="loading-box">Se încarcă...</p>}
        {error   && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: 'var(--surface-3)' }}>
                  {['ID', 'Nume complet', 'Email', 'Oraș', 'Acțiuni'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                      Nu există utilizatori înregistrați.
                    </td>
                  </tr>
                )}
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? 'white' : 'var(--surface-2)' }}>
                    <td style={tdStyle}>{u.id}</td>
                    <td style={tdStyle}>{u.full_name}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.city}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEdit(u)} style={editBtnStyle}>✏️ Edit</button>
                      <button onClick={() => { setDeleteId(u.id); setDeleteErr(null); }} style={deleteBtnStyle}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <Overlay onClose={closeModal}>
          <div style={modalStyle}>
            <h3 style={{ margin: '0 0 18px' }}>
              {modal.mode === 'add' ? 'Adaugă utilizator nou' : `Editează utilizatorul #${modal.data.id}`}
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <Field label="Nume complet">
                <input
                  className="filter-select" style={{ width: '100%' }}
                  type="text" placeholder="ex: Andrei Ionescu"
                  value={modal.data.full_name}
                  onChange={e => handleField('full_name', e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  className="filter-select" style={{ width: '100%' }}
                  type="email" placeholder="ex: andrei@email.com"
                  value={modal.data.email}
                  onChange={e => handleField('email', e.target.value)}
                />
              </Field>
              <Field label="Oraș">
                <select
                  className="filter-select" style={{ width: '100%' }}
                  value={modal.data.city}
                  onChange={e => handleField('city', e.target.value)}
                >
                  <option value="">Selectează un oraș</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
        <Overlay onClose={() => { setDeleteId(null); setDeleteErr(null); }}>
          <div style={{ ...modalStyle, maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 12px' }}>Confirmare ștergere</h3>
            <p style={{ color: 'var(--muted)', margin: '0 0 10px' }}>
              Ești sigur că vrei să ștergi utilizatorul <strong>#{deleteId}</strong>?
            </p>
            {deleteErr && (
              <p style={{
                color: 'var(--danger)', background: 'rgba(185,28,28,0.08)',
                border: '1px solid rgba(185,28,28,0.2)',
                borderRadius: 10, padding: '10px 14px', margin: '0 0 14px',
                fontSize: '0.9rem',
              }}>
                ⚠️ {deleteErr}
              </p>
            )}
            {!deleteErr && (
              <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 22px' }}>
                Utilizatorii cu comenzi active nu pot fi șterși.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setDeleteId(null); setDeleteErr(null); }} style={cancelBtnStyle}>
                {deleteErr ? 'Închide' : 'Anulează'}
              </button>
              {!deleteErr && (
                <button onClick={() => handleDelete(deleteId)} style={{ ...deleteBtnStyle, padding: '10px 18px', borderRadius: 10 }}>
                  🗑 Șterge
                </button>
              )}
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

// ── Styles ───────────────────────────────────────────────────────────────

const tableStyle = {
  width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem',
  borderRadius: 12, overflow: 'hidden',
};
const thStyle = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 600,
  color: 'var(--muted)', fontSize: '0.82rem', whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
};
const tdStyle = {
  padding: '11px 16px', borderBottom: '1px solid var(--border)',
  color: 'var(--text)',
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
  maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto',
};