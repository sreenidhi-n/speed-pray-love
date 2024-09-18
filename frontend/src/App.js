import React, { useState, useEffect } from 'react';
import CarModal from './components/CarModel'

const App = () => {
  const [years, setYears] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [year, setYear] = useState('');
  const [driver1, setDriver1] = useState('');
  const [driver2, setDriver2] = useState('');
  const [track, setTrack] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch available years, drivers, and tracks from backend when component mounts
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/get-options');
        const data = await res.json();
        setYears(data.years);
        setDrivers(data.drivers);
        setTracks(data.tracks);
        setYear(data.years[0]);
        setDriver1(data.drivers[0]);
        setDriver2(data.drivers[1] || data.drivers[0]);
        setTrack(data.tracks[0]);
      } catch (err) {
        setError('Error fetching options');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      setError('');
      const response = await fetch('http://localhost:5000/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, driver1, driver2, track })
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
  
      const data = await response.json();
      setImageUrl(`data:image/png;base64,${data.image}`); // Display Base64 image directly
    } catch (err) {
      setError('Error generating image');
    }
  };  

  return (
    <div>
      <h1>F1 Data Analysis</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <CarModal />
      <div>
        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Driver 1:</label>
        <select value={driver1} onChange={(e) => setDriver1(e.target.value)}>
          {drivers.map((driver) => (
            <option key={driver} value={driver}>{driver}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Driver 2:</label>
        <select value={driver2} onChange={(e) => setDriver2(e.target.value)}>
          {drivers.map((driver) => (
            <option key={driver} value={driver}>{driver}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Track:</label>
        <select value={track} onChange={(e) => setTrack(e.target.value)}>
          {tracks.map((trk) => (
            <option key={trk} value={trk}>{trk}</option>
          ))}
        </select>
      </div>

      <button onClick={handleSubmit}>Generate Image</button>

      {imageUrl && (
        <div style={{ textAlign: 'center' }}>
          <img 
            src={imageUrl} 
            alt="F1 Mini-Sector Comparison" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', border: '2px solid #ccc' }} 
          />
        </div>
      )}

    </div>
  );
};

export default App;
