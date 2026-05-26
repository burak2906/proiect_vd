import React from 'react';

const MENU_ITEMS = [
  { key: 'Overview',    label: 'Overview',    icon: '▦' },
  { key: 'Customers',   label: 'Customers',   icon: '👤' },
  { key: 'Ratings',     label: 'Ratings',     icon: '★' },
  { key: 'Delivery',    label: 'Delivery',    icon: '🚚' },
  { key: 'Predictions', label: 'Predictions', icon: '◎' },
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
      </nav>

      <div className="sidebar-footer">
        <p>Analytics workspace</p>
        <small>Food delivery insights</small>
      </div>
    </aside>
  );
};

export default Sidebar;