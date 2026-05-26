import React from 'react';

const Sidebar = () => {
  const menuItems = [
    'Overview',
    'Customers',
    'Ratings',
    'Delivery',
    'Predictions'
  ];

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
        {menuItems.map((item) => (
          <button key={item} className={`nav-item ${item === 'Overview' ? 'active' : ''}`}>
            {item}
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