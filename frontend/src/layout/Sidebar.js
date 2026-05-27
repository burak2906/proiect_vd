import React from 'react';

const MENU_ITEMS = [
  { key: 'Overview',    label: 'Overview',    icon: '▦' },
  { key: 'Customers',   label: 'Customers',   icon: '👤' },
  { key: 'Ratings',     label: 'Ratings',     icon: '★' },
  { key: 'Delivery',    label: 'Delivery',    icon: '🚚' },
  { key: 'Predictions', label: 'Predictions', icon: '◎' },
];

const MANAGEMENT_ITEMS = [
  { key: 'Orders', label: 'Comenzi',      icon: '📋' },
  { key: 'Users',  label: 'Utilizatori',  icon: '👥' },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">FD</div>
        <div>
          <h2>FoodOps</h2>
          <span>Manager Dashboard</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          padding: '0 4px', marginBottom: 4,
        }}>
          Analytics
        </div>
        {MENU_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}

        <div style={{
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          padding: '0 4px', marginTop: 16, marginBottom: 4,
        }}>
          Management
        </div>
        {MANAGEMENT_ITEMS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Analytics workspace</p>
        <small>Food delivery insights</small>
      </div>
    </aside>
  );
};

export default Sidebar;