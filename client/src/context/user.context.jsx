import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../config/axios.js';
import { useNavigate } from 'react-router-dom';

// Create UserContext
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Function to ping the server and check authentication
    const authenticateUser = async () => {
        try {
            const response = await axiosInstance.post('/user/refresh-token');
            if (response.data.statusCode === 200 && response.data.success) {
                setUser(response.data.data); // Update user state
                return { status: 200 }; // FIXED: Return a response object
            }
            // FIXED: Added explicit return for non-success cases
            return { status: response.data.statusCode || 403 };
        } catch (error) {
            if (error.response?.status === 401) {
                setUser(null); // Clear user state
                return { status: 401 };
            }
            console.error('Error authenticating user:', error);
            return { status: error.response?.status || 500 };
        }
    };

    // Function to ping the server on initial load
    const pingServer = async () => {
        try {
            const response = await authenticateUser();
            if (response.status === 200) {
                console.log('Authorized user');
            } else if (response.status === 401) {
                console.log('Unauthorized user');
                navigate('/login');
            }
        } catch (err) {
            console.error('Error pinging server:', err);
            navigate('/login');
        }
    };

    // Ping the server when the component mounts
    useEffect(() => {
        if (!user) {
            pingServer();
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, authenticateUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use UserContext
export const useUser = () => useContext(UserContext);

export default UserProvider;