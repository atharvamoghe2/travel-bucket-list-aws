import React from 'react';
import { LogOut, MapPin } from 'lucide-react';

const Sidebar = ({ pins, onPinClick, onLogout, user }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <MapPin size={24} color="var(--accent)" />
          Travel Bucket List
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
      <div style={{ padding: '1rem 1.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Welcome, {user?.name}
      </div>
      <div className="pin-list">
        {pins.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            No pins yet. Double-click on the map to add one!
          </p>
        ) : (
          pins.map((pin) => (
            <div 
              key={pin._id} 
              className="pin-card"
              onClick={() => onPinClick(pin.coordinates)}
            >
              <div className="pin-title">{pin.title}</div>
              <div className="pin-desc">{pin.description}</div>
              <span className={`badge badge-${pin.category}`}>
                {pin.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
