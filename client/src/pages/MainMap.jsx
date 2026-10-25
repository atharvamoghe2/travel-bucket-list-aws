import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MainMap = () => {
  const [pins, setPins] = useState([]);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/pins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPins(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Error fetching pins', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePinClick = (coords) => {
    setFlyToCoords(coords);
  };

  return (
    <div className="app-container">
      <Sidebar 
        pins={pins} 
        onPinClick={handlePinClick} 
        onLogout={handleLogout} 
        user={user}
      />
      <div className="map-container">
        <MapComponent 
          pins={pins} 
          setPins={setPins} 
          flyToCoords={flyToCoords} 
          user={user}
        />
      </div>
    </div>
  );
};

export default MainMap;
