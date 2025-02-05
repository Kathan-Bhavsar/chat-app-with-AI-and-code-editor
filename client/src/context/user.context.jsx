import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios.js'; // Ensure axiosInstance is correctly imported

// Create context to manage user data across the app
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            return parsedUser && parsedUser._id ? parsedUser : null;
        }
        return null;
    });

    // Effect to save user data to localStorage when user state changes
    useEffect(() => {
        if (user && user._id) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Function to refresh token if the access token expires
    const refreshToken = async () => {
        try {
            const response = await axiosInstance.post('/user/refresh-token');
            if (response.data.user && response.data.user._id) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        }
    };

    // Effect to check token expiration and refresh if needed
    useEffect(() => {
        if (user && user.tokenExpiration) {
            const tokenExpiration = new Date(user.tokenExpiration);
            const now = new Date();
            if (tokenExpiration < now) {
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

export const useUser = () => useContext(UserContext);
