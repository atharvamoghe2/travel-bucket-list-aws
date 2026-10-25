import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FlyToControl = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 14, { animate: true });
    }
  }, [coords, map]);
  return null;
};

const AddPinInteraction = ({ onAddClick }) => {
  useMapEvents({
    dblclick(e) {
      onAddClick(e.latlng);
    }
  });
  return null;
};

const MapComponent = ({ pins, setPins, flyToCoords, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sightseeing',
    budgetEstimate: ''
  });

  const handleMapDblClick = (latlng) => {
    setNewPinCoords(latlng);
    setShowForm(true);
    setFormData({ title: '', description: '', category: 'Sightseeing', budgetEstimate: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budgetEstimate: Number(formData.budgetEstimate),
        coordinates: newPinCoords
      };
      
      const res = await axios.post(`${API_URL}/api/pins`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setPins([res.data, ...pins]);
      setShowForm(false);
    } catch (err) {
      console.error('Error adding pin:', err);
      alert('Failed to add pin.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/pins/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPins(pins.filter(pin => pin._id !== id));
    } catch (err) {
      console.error('Error deleting pin:', err);
      alert('Failed to delete pin.');
    }
  };

  return (
    <>
      <MapContainer 
        center={[20.5937, 78.9629]} // India center
        zoom={5} 
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FlyToControl coords={flyToCoords} />
        <AddPinInteraction onAddClick={handleMapDblClick} />

        {pins.map((pin) => (
          <Marker key={pin._id} position={[pin.coordinates.lat, pin.coordinates.lng]}>
            <Popup className="marker-popup">
              <div className="marker-popup-title">{pin.title}</div>
              <div className="marker-popup-category">
                <span className={`badge badge-${pin.category}`}>{pin.category}</span>
              </div>
              <div className="marker-popup-desc">{pin.description}</div>
              <div className="marker-popup-budget">Est. Budget: ${pin.budgetEstimate}</div>
              <div className="marker-popup-user">Added by: {pin.addedBy?.name || 'Unknown'}</div>
              
              {user?.id === pin.addedBy?._id && (
                <button 
                  onClick={() => handleDelete(pin._id)}
                  className="btn btn-danger"
                  style={{ marginTop: '5px' }}
                >
                  Delete
                </button>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <div className="popup-header">
              <h3>Add a New Pin</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget Estimate ($)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={formData.budgetEstimate}
                  onChange={(e) => setFormData({...formData, budgetEstimate: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Pin</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MapComponent;
