import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios.js'; // Ensure axiosInstance is correctly imported

// Create context to manage user data across the app
export const UserContext = createContext();

// UserProvider component to wrap the app and provide user data context
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Check if user data is stored in localStorage and load it
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Effect to save user data to localStorage when user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user)); // Store in localStorage if user is logged in
        } else {
            localStorage.removeItem('user'); // Remove from localStorage if user logs out
        }
    }, [user]);

    // Function to refresh token if the access token expires
    const refreshToken = async () => {
        try {
            const response = await axiosInstance.post('/user/refresh-token');
            setUser(response.data.user); // Set user data to state if token refresh is successful
        } catch (err) {
            setUser(null); // If token refresh fails, clear user data
        }
    };

    // Optionally, you can check for the user on mount or on every render
    useEffect(() => {
        if (user) {
            const tokenExpiration = new Date(user.tokenExpiration); // Assuming token expiration is in user object
            const now = new Date();
            if (tokenExpiration < now) {
                // Refresh token if it is expired
                refreshToken();
            }
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to access user context in any component
export const useUser = () => useContext(UserContext);
