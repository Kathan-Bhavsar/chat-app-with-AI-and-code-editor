import React, { useEffect, useState , useContext} from 'react';
import axios from 'axios';
import { UserContext } from '../context/user.context.jsx';

function Home() {
  const [message, setMessage] = useState(''); // User-friendly message
  const [error, setError] = useState(null); // Error messages

  const { user } = useContext(UserContext);

  // Function to fetch protected data using access token
  const fetchData = async () => {
    try {
      // Attempt to fetch data
      await axios.get('/api/protected-route', {
        withCredentials: true, // Include cookies (e.g., refreshToken)
      });
      console.log('Data fetched successfully!'); // Feedback for debugging (optional)
      setError(null); // Clear any errors
    } catch (err) {
      if (err.response?.status === 401) {
        // If unauthorized (access token expired), refresh tokens
        try {
          await refreshAccessToken(); // Call refresh token API
          await fetchData(); // Retry fetching data
        } catch (refreshErr) {
          setError('Session expired. Please log in again.');
          setMessage('');
        }
      } else {
        setError('An error occurred while fetching data.');
        setMessage('');
      }
    }
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    try {
      await axios.post(
        '/user/refresh-token', 
        {}, // No body needed if refreshToken is in cookies
        {
          withCredentials: true, // Include cookies for refresh token
        }
      );
      setMessage('Tokens refreshed successfully!'); // Feedback for debugging (optional)
    } catch (err) {
      console.error('Failed to refresh access token:', err);
      throw new Error('Failed to refresh tokens');
    }
  };

  // Load data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Console the user object
  useEffect(() => {
    if (user) {
      console.clear(); // Clear previous logs (optional, for a clean console)
      console.log("User:", user); // Log the user object
    }
  }, [user]);
  return (
    <div>
      <h1>Home</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && message && <p>{message}</p>}
    </div>
  );
}

export default Home;
